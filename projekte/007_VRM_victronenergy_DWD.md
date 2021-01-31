---
title: Victron Energy VRM und DWD Wetterwarnungen Integration 
description: Victron Energy VRM und Deutsche Wetterdienst (DWD) Warnungen Integration
introimage: "/images/projekte/flash-862620_640.jpg"
type: projekte
lang: de-DE
published: 15.06.2020
sitemap:
  exclude: false
  changefreq: monthly
---
# {{ $frontmatter.title }}
![L1](/images/projekte/flash-862620_640.jpg)
<TOC />


## Problemstellung

Das Potential Solarenergie Überschuss zu speichern und bei Bedarf wieder abzugeben hängt stark von der Größe des Speichers ab. Daher ist es gut, den Akku möglichst tief entladen zu lassen, um am nächsten Tag genug Platz für neue Energie zu schaffen. Da ich meinen Akku auch als USV für bestimmte Verbraucher, wie beispielsweise Kühlschrank, Kommunikationsequipment und Pumpe der Aquaponikanlage nutze, habe ich einen mindest Füllstand von 25% konfiguriert. Diese ca 2,5 kWh decken ungefähr 24h Stromausfall ab. Im Falle einer besonderen Gefahrenlage durch Stürme und Unwetter, würde ich gerne den Mindestladestand erhöhen - man weiß ja nie.

## Hardware

- Color Control GX
- MultiGrid 48/3000/35-50
- Energy Meter ET340
- 4 x PYLONTECH LiFePO4 48Volt 2,4kWh

## These

Der CCGX verfügt über einen :MQTT: Broker und das sogenannte MinimumSocLimit lässt sich hierrüber entsprechend einstellen. Der Deutsche Wetter Dienst(DWD) stellt kostenfrei Unwetterwarnungen ([DWD Warnungen](https://www.dwd.de/DWD/warnungen/warnapp/json/warnings.json)) via JSON zur Verfügung. Unter Verwendung diese Daten kann automatisiert der Schwellwert erhöht und nach Ende des Ereignis wieder abgesenkt werden.

## Experiment

### MQTT Konfiguration auslesen und verändern

Auslesen der aktuellen Konfiguration
```shell
mosquitto_sub -v -I myclient_ -t "N/+/settings/0/Settings/CGwacs/BatteryLife/MinimumSocLimit" -h 192.168.0.201

N/<SERIAL PLATZHALTER>/settings/0/Settings/CGwacs/BatteryLife/MinimumSocLimit {"value": 25.0}

```

Neuen Wert via MQTT Schreiben. Hierbei muss das Topic angepasst werden und das "N" am Anfang durch ein "W" ausgetauscht werden.
```shell
mosquitto_pub -h 192.168.0.201 -t 'W/64cfd98935c5/settings/0/Settings/CGwacs/BatteryLife/MinimumSocLimit' -m '{"value": "30"}'
```

Die Konfiguration scheint in 1% Schritten möglich zu sein, allerdings kann das CCGX nur in 5% Schritten die Einstellung anzeigen.

### DWD Daten

Testen ob man die Daten herunterladen kann: [DWD Warnungen](https://www.dwd.de/DWD/warnungen/warnapp/json/warnings.json)

```shell
curl -q https://www.dwd.de/DWD/warnungen/warnapp/json/warnings.json -o warnings.json

file warnings.json
warnings.json: UTF-8 Unicode text, with very long lines, with no line terminators
```

An der Stelle zeigt sich, das es sich nicht um JSON, sondern JSON-P handelt. Um diese Daten mit json parsern verwenden zu können muss alles vor der Ersten "(" und alles nach der letzten ")" gelöscht werden. Zusätzlich muss die UTF-8 Kodierung beachtet werden.

### JSON Format verstehen

Jede Warnung hat eine sogannte WARNCELLID, in dem Beispiel "109172000". Um die relevante ID für die eigene Gegend zu finden, bietet der DWD folgende 
[Google Earth KML](https://maps.dwd.de/geoserver/dwd/wms?service=WMS&version=1.1.0&request=GetMap&layers=dwd:Warngebiete_Kreise&styles=&bbox=5.86625035072566,47.2701236047002,15.0418156516163,55.0583836008072&width=768&height=651&srs=EPSG:4326&format=application%2Fvnd.google-earth.kml%2Bxml) an. In den Details zu jedem Kreis steht die WARNCELLID.

Alternativ kann man diese Information auch als [CSV](http://www.dwd.de/DE/leistungen/gds/help/warnungen/cap_warncellids_csv.csv?__blob=publicationFile&v=4) herunterladen. Die genaue Definition der einzelnen Attribute findet man [hier](https://www.home-assistant.io/integrations/dwd_weather_warnings/).

Für dieses Projekt benötige ich alle Meldungen mit:

- type: 0: Gewitter, Starkes Gewitter und type 1: Windböen, Sturmböen
- level: 2: Warnungen vor markantem Wetter, 3: Unwetterwarnungen, 4: Warnungen vor extremem Unwetter

```json
"time" : 1592240060000,
   "warnings" : {
      "109172000" : [
         {
            "end" : 1592280000000,
            "state" : "Bayern",
            "type" : 2,
            "start" : 1592204520000,
            "regionName" : "Kreis Berchtesgadener Land",
            "event" : "ERGIEBIGER DAUERREGEN",
            "level" : 4,
            "altitudeStart" : null,
            "headline" : "Amtliche UNWETTERWARNUNG vor ERGIEBIGEM DAUERREGEN",
            "instruction" : "ACHTUNG! Hinweis auf mögliche Gefahren: Infolge des Dauerregens sind unter anderem Hochwasser an Bächen und kleineren Flüssen sowie Überflutungen von Straßen möglich. (Details: www.hochwasserzentralen.de). Es können zum Beispiel Erdrutsche auftreten. Schließen Sie alle Fenster und Türen!",
            "altitudeEnd" : null,
            "description" : "Nach bisher beobachteten Niederschlagsmengen von 20 bis 30 l/m² tritt ergiebiger Dauerregen wechselnder Intensität auf. Dabei werden nochmals Niederschlagsmengen zwischen 40 l/m² und 60 l/m² erwartet.",
            "stateShort" : "BY"
         },
```

### Programmierung

Die Programmiersprache spielt eigentlich keine Rolle und da ich auf dem Raspi, der letzten Endes als Server verwendet wird, schon einiges mit python mache war die Wahl schnell getroffen.

Das Ergebnis kann auf [github.com/scurth/victron_dwd](https://github.com/scurth/victron_dwd) heruntergeladen werden.

```shell
./victron_dwd/dwd-warning.py
Serial Number not set, use option -s
Usage: dwd_warning.py -s XXX [-v] [-b] [-p] [-u] [-r] [-h]
-v: verbose output, default False
-b: MQTT Broker IP, default 127.0.0.1
-p: MQTT Broker Port, default 1883
-r: DWD region, default 112069000 = Potsdam-Mittelmark
-s: Victron Serial Number, mandatory, no default
-u: DWD warnings.json url, default https://www.dwd.de/DWD/warnungen/warnapp/json/warnings.json
-h: shows this help

./victron_dwd/dwd-warning.py  --broker 192.168.0.201 -s XXX -r 112069000
Keine Warnung vorhanden
```

Um das Ganze zu testen kann man eine WARNCELLID mit einer aktuellen Warnung nehmen.

```shell
curl -q https://www.dwd.de/DWD/warnungen/warnapp/json/warnings.json|cut -c1-250 
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 13476  100 13476    0     0  81672      0 --:--:-- --:--:-- --:--:-- 81672
warnWetter.loadWarnings({"time":1592246965000,"warnings":{"109172000":[{"regionName":"Kreis Berchtesgadener Land","start":1592204520000,"end":1592280000000,"state":"Bayern","type":2,"level":4,"description":"Nach bisher beobachteten Niederschlagsmenge

./victron_dwd/dwd-warning.py  --broker 192.168.0.201 -s XXX -r 109172000
Alert Level  4
Start =>  1592204520000
End =>  1592280000000
Setting SOC to 50%

```

## Das Ergebnis
Grosses Lob an Victron Energy für eine vorzügliche Integrierbarkeit und natürlich auch an den DWD für die Bereitstellung der Warndaten. Auch wenn die Stromnetze in Deutschland sehr gut sind und es selten zu Stromausfällen kommt, ist es beruhigend zu Wissen, daß meine Mindestreserve jetzt bei schwierigen Wetterlagen erhöht wird. Die MinimumSOC Werte werden auch via Telegraf in die InfluxDB geschrieben und dann via Grafana dargestellt. Im Grafana ist ein Alarm konfiguriert, welcher via Telegram einen Alarm schickt, sobald der Wert ungleich 25 ist. 

## Wie gehts weiter
- Grafana Annotation mit genauer Warnmeldung
- warten auf Bugs und diese dann fixen
