---
title: Miflora Pflanzensensor
description: Daten abgreifen und sinnvoll speichern
introimage: "/images/miflora-sensor.jpg"
author: Sascha Curth
type: article
lang: de-DE
published: 22.02.2020
modified: 26.02.2020
---
# Inhalt
<TOC />

## Überblick
Der "Flower Care Xiaomi Mi Flora" ist ein 4 in 1 Bluetooth Sensor, welcher Bodenfeuchtigkeit, Helligkeit, Bodenleitfähigkeit aka Dünger und Temperatur messen kann. Man wird hierrüber keine Information bekommen, ob man die richtige Nährstoffzusammensetzung hat, aber um eine grobe Übersicht zu bekommen, sind diese Sensoren sehr gut zu gebrauchen. In folgende wird gezeigt, wie man die Geräte via bluetooth findet, wie das interne Daten Layout aussieht und wie man die Daten kontinuierlich speichert um diese dann mittels Grafana zu visualiseren.

![miflora-sensor](/images/miflora-sensor.jpg)

## Quick & Dirty
Auf dem raspberry pi 3 können wir den eingebauten bluetooth chip verwenden, auf anderen System ist ggfls. ein bluetooth stick notwendig.

```shell
sudo apt-get install bluetooth bluez bluez-tools rfkill rfcomm
```

Da der Sensor "low energy (le)" bluetooth verwendet, müssen wir entsprechend einen "lescan" durchführen

```shell
sudo hcitool lescan
LE Scan ...
C4:7C:8D:67:2E:DE Flower care
C4:7C:8D:66:A6:92 Flower care
C4:7C:8D:66:A7:44 Flower care
C4:7C:8D:66:A6:98 Flower care
C4:7C:8D:66:AA:05 Flower care
```

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
Hierzu nutzen wir ein anderes bestehendes open-source project, welche auf dem miflora Projekt basiert.


```shell
git clone  https://github.com/sergem155/miflora-influxdb.git
cd miflora-influxdb
```

In der config.py werden die Bluetooth Hardware Adressen einem sinnvollen Namen zugeordnet und unter "to_scan" aufgelistet. Die InfluxDB Zugangsdaten müssen natürlich ebenfalls angepasst werden. Wie man die InfluxDB installiert und verwaltet ist hier beschrieben "TBD".

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
>Beim folgenden Schritt werden alle historischen Daten vom Gerät geladen und anschliessend gelöscht. 

Da der Sensor alle Daten stündlich intern abspeichert, reicht es theoretisch aus alle paar Tage die Daten abzufragen. Wenn man die Daten jedoch zeitnah im Grafana sehen möchte, empfiehlt sich ein stündlicher cronjob, kurz nach der vollen Stunde.

```shell
3 * * * * <pfad zum miflora>/miflora-influxdb/poll-insert.py 2>&1 >> /var/log/miflora-influxdb.log
```

Ab diesem Moment sind die Daten in der InfluxDB und können mittels Grafana visualisiert werden. Im Grafana können Schwellwerte und Alarme zu verschiedensten Systemen eingrichtet werden. 

![miflora-grafana](/images/miflora-grafana.png)

## Daten via MQTT zur Verfügung stellen
Alternativ zur direkten Speicherung in der InfluxDB bietet es sich an, die Daten via MQTT zur Verfügung zu stellen und dedizierte Überwacher bzw Aktoren einzurichten.

## Firmware aktualisieren
Derzeit nur mittels "Flowr Care" App möglich.

