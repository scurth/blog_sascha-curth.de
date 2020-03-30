---
title: IoT Projekte
description: Optimierungen, Spielereien, etc.
author: Sascha Curth
lang: de-DE
meta:
 - name: IoT Projekte
 - content: opensource tasmota influxdb grafana raspberry linux mqtt
---
# Wie kann man hier mitmachen

Alle Inhalte sind auch auf <a href="https://github.com/scurth/blog_sascha-curth.de" target=_github>github.com</a> verfügbar und hierüber kann gerne diskutiert werden. Wem das zu Nerdy ist, der kann mich auch gerne via <a href="mailto:der-iot-rebell@sascha-curth.de?subject=IoT Rebell Blog">email</a> erreichen.

## Umgesetzte Projekte zum Nachmachen und inspirieren
<projekte />

## Projekt Ideen für die Zukunft

Die folgende Liste sind potentielle neue Projektideen, sind aber gedanklich noch nicht ausgereift um umgesetzt werden zu können.

### Video Türklingel

- Raspberry
- OpenSource, lokales Videokonferenz System
- popup auf allen familien handys, oder klingelknopf pro Bewohner

### VictronEnergy - VRM

- MQTT Daten auslesen, nach InfluxDB schreiben
- Grafana Dashboard

Links:
- [victron energy](https://www.victronenergy.com/live/open_source:start)

### NAS Server

- SSD Platten
- ZFS / BTRFS
- FreeNAS oder Linux
- Backup Ziel für Timemachine
- Backup Ziel für rsync / Linux

### Kommunisten Backup

Die Idee ist eine Offsite Backup Speicher für Freunde bereit zu stellen
- aufbauend auf dem NAS Server
- Extra SSD ohne Redundanz als Backup Mirror für Freunde
- Eingehende Daten sind vor dem Versand verschlüsselt
- Nur die letzte Version wird gespeichert


### VPN

- OpenVPN einwahl in den eigenen Haushalt
- IOS, Android und MacOS client

### internes Netzwerk neu gestalten

IoT Geräte:
- WPA2, VLAN Tagging für IOT Geräte mit iptables und Regelwerk pro Gerät
- MacAdress Filter
- Static DHCP

Gast Netzwerk
- WPA2, WPA3
- Bandbreitenlimitierung pro Gerät
- Passwort pro Gerät / ggfls oauth

### interner OAuth Server

- zur Absicherung von internen Web Apps
- als WLAN Authorisierung

### Freiwillige Selbstkontrolle für Kinder

- Erfassung der Datenkommunikationsdauer
- jeden Tag, beim ersten verbinden anzeige der Top 5 (z.b. minecraft, youtube)
- Eingabefeld für Dauerschätzung
- nach der Eingabe erfolgt die Anzeige der tatsächlichen Dauer
- Freischaltung des Internetzugangs nachdem die jeweilige Differenz ausgerechnet wurde
- Wochenbericht per mail mit Grafik für Schätzung vs Realität

### Einkaufsliste / Inventar / Verbrauch

- Einkausliste für Familie
- Inventar Management - min. Menge von zb. Spaghetti
- Barcode scan von gekauften Waren
- Barcode scan bei Verbrauch?

Links:
- [https://grocy.info/](Grocy.info)
