---
title: Miflora Pflanzensensor
description: Daten abgreifen und sinnvoll speichern
introimage: "/images/miflora-sensor.jpg"
type: article
lang: de-DE
published: 22.02.2020
sitemap:
  exclude: false
  changefreq: monthly
---
# Miflora Pflanzensensor
<TOC />

# In einem Satz
Der "Flower Care Xiaomi Mi Flora" ist ein 4 in 1 Bluetooth Sensor zur kontinuierlichen Bestimmung der Pflanzenwachstumsumgebung und kann sehr einfach mit Linux und einem RaspberryPi 3 oder RaspberryPi 4 abgefragt werden.

## Überblick
Mittels Bluetooth stellt der Pflanzensensor Informationen zur aktuellen Bodenfeuchtigkeit und -leitfähigkeit zur Verfügung, mit deren Hilfe man die Düngung und Wassergabe anpassen kann. Zusätzlich wir die Umgebungstemperatur und Lichtmenge protokolliert. Diese Information geben keinen Aufschluss darüber, ob Nährstoffzusammensetzung korrekt ist, aber für eine grobe Übersicht und eine Trendanalyse sind diese Sensoren sehr gut zu gebrauchen. 

Im Folgende wird gezeigt
- wie man die Geräte via bluetooth findet
- wie das interne Daten Layout aussieht
- wie man die Daten kontinuierlich speichert, um diese mittels Grafana zu visualiseren.

![miflora-sensor](/images/miflora-sensor.jpg)

## Quick & Dirty
RaspberryPi 3 und RaspberryPi 4 verfügen über einen eingebauten Bluetooth Chip, welcher unter Linux/Raspbian ohne weitere Konfiguration benutzt werden kann.

```shell
sudo apt-get install bluetooth bluez bluez-tools rfkill rfcomm
```

Da der Pflanzensensor "low energy (le)" Bluetooth verwendet, müssen wir entsprechend einen "<b>le</b>scan" statt des normalen "scan" durchführen. Hier sollten nun alle Pflanzensensoren gelistet werden. Die Hardware Adressen benötigen wir für die nächsten Schritte.

```shell
sudo hcitool lescan
LE Scan ...
C4:7C:8D:67:2E:DE Flower care
C4:7C:8D:66:A6:92 Flower care
C4:7C:8D:66:A7:44 Flower care
C4:7C:8D:66:A6:98 Flower care
C4:7C:8D:66:AA:05 Flower care
```
Als nächsten Schritt clonen wir das miflora repository und testen den Zugriff auf einen der Pflanzensensoren.
```shell
git clone https://github.com/open-homeautomation/miflora.git
cd miflora
./demo.py poll C4:7C:8D:66:A6:98

Getting data from Mi Flora
FW: 3.2.1
Name: Flower care
Temperature: 21.8
Moisture: 74
Light: 1350
Conductivity: 2171
Battery: 98
```

## Daten in die InfluxDB schreiben
Um die Daten visualisieren zu können, müssen diese gespeichert. Hierzu nutzen wir ein anderes open-source project, welches auf dem vorher verwendeten miflora Projekt basiert, und lassen die Daten in eine InfluxDB schreiben.

```shell
git clone  https://github.com/sergem155/miflora-influxdb.git
cd miflora-influxdb
```

In der config.py werden die Bluetooth Hardware Adressen einem sinnvollen Namen zugeordnet und unter "to_scan" aufgelistet. Die InfluxDB Zugangsdaten müssen natürlich ebenfalls angepasst werden. Wie man die InfluxDB installiert und verwaltet ist hier beschrieben: "Platzhalter".

```shell
cat config.py 
devices ={
"Heizung":"c4:7c:8d:66:a7:44",
"GrowBed":"c4:7c:8d:66:a6:92",
"Fenster":"c4:7c:8d:66:a6:98",
}

to_scan = ["Heizung","GrowBed","Fenster"]

influx_args=('localhost', 8086, 'root', 'pass', 'plant_monitors')
```

>**ACHTUNG**
>
>Im nun Folgendem Schritt werden alle historischen Daten vom Gerät geladen und anschliessend gelöscht. Sollte es hierbei Probleme geben, können die Daten nicht wieder hergestellt werden.

Da der Sensor alle Daten stündlich intern abspeichert, reicht es theoretisch aus alle paar Tage die Daten abzufragen. Wenn man die Daten jedoch zeitnah im Grafana sehen möchte, empfiehlt sich ein stündlicher cronjob, kurz nach der vollen Stunde.

```shell
3 * * * * <pfad zum miflora>/miflora-influxdb/poll-insert.py 2>&1 >> /var/log/miflora-influxdb.log
```

Ab diesem Moment sind die Daten in der InfluxDB und können mittels Grafana visualisiert werden. Im Grafana muss nun eine neue Data Source für InfluxDB eingerichtet werden und wie hier im Beispiel auf die Datenbank "plant_monitors" konfiguriert werden. Die einzelnen Werte können auch mit einem Grafana Schwellwert und Alarm, zb. via email, Slack oder Telegram, versehen werden.

![miflora-grafana](/images/miflora-grafana.png)

## Daten via MQTT zur Verfügung stellen
Alternativ zur direkten Speicherung in der InfluxDB bietet es sich an, die Daten via MQTT zur Verfügung zu stellen und dedizierte Überwacher bzw Aktoren einzurichten.

Das folgende Projekt enthält eine sehr gute Dokumentation, wie man es einrichtet. Ich persönlich favorisiere es den daemon als service laufen zu lassen, aber die angebotene docker Variante kann ebenfalls sinnvoll sein.

> [https://github.com/ThomDietrich/miflora-mqtt-daemon](https://github.com/ThomDietrich/miflora-mqtt-daemon)

## Firmware aktualisieren
Derzeit nur mittels "Flower Care" App möglich.

