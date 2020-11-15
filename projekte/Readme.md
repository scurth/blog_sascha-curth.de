---
title: IoT Projekte
description: Optimierungen, Spielereien, etc.
author: Sascha Curth
lang: de-DE
meta:
 - name: IoT Projekte
 - content: opensource tasmota influxdb grafana raspberry linux mqtt
sidebar: true
---
# Umgesetzte Projekte zum Nachmachen und als Inspiration

<projekte />

# Wie kann man hier mitmachen

Alle Inhalte sind auch auf <a href="https://github.com/scurth/blog_sascha-curth.de" target=_github>github.com</a> verfügbar und hierüber kann gerne diskutiert werden. Wem das zu Nerdy ist, der kann mich auch gerne via <a href="mailto:der-iot-rebell@sascha-curth.de?subject=IoT Rebell Blog">email</a> erreichen oder in der Telegram Gruppe ["IoT Doktor"](https://t.me/IoT_Doktor) Fragen stellen oder anderen Nutzern helfen.

Alle IoT Rebellen Seiten und Beiträge sind frei von Affiliate, Trackern, Werbung und sind zu 100% privat finanziert. Diese Unabhängikeit ist wichtig für das Ziel die Hoheit über die eignene Daten und Geräte zu erlangen und zu behalten. Wenn der Inhalt geholfen hat eine eigene Entscheidungen zu beeinflussen oder ein konkretes Problem gelöst hat, würde ich mich sehr über Feedback freuen. Eine finanzielle Unterstützung ist ebenfalls in Form einer Spende möglich.

<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
<input type="hidden" name="cmd" value="_s-xclick" />
<input type="hidden" name="hosted_button_id" value="DGQZ2XMSRRK86" />
<input type="image" src="https://www.paypalobjects.com/de_DE/DE/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Spenden mit dem PayPal-Button" />
<img alt="" border="0" src="https://www.paypal.com/de_DE/i/scr/pixel.gif" width="1" height="1" />
</form>

# Projekt Ideen für die Zukunft

Die folgende Liste sind potentielle neue Projektideen, sind aber gedanklich noch nicht ausgereift um umgesetzt werden zu können.

## Video Türklingel

- Raspberry
- OpenSource, lokales Videokonferenz System
- popup auf allen familien handys, oder klingelknopf pro Bewohner

Links
- [https://matrix.org/blog/2020/04/06/running-your-own-secure-communication-service-with-matrix-and-jitsi](matrix.org)
- [https://github.com/jitsi/jitsi-meet/blob/master/doc/quick-install.md](Jitsi Quick Install)

## Envertec EVB202 Bridge

- Solarertragsdaten werden derzeit direkt an das envertec Portal geschickt
- Proxy liest Dateen mit, schickt diese an den lokalen MQTT und leitet diese weiter ans Portal

Links
- [enverproxy.py](https://gitlab.eitelwein.net/MEitelwein/Enverbridge-Proxy/blob/master/enverproxy.py)

## NAS Server

- SSD Platten
- ZFS / BTRFS
- FreeNAS oder Linux
- Backup Ziel für Timemachine
- Backup Ziel für rsync / Linux

## Kommunisten Backup

Die Idee ist eine Offsite Backup Speicher für Freunde bereit zu stellen
- aufbauend auf dem NAS Server
- Extra SSD ohne Redundanz als Backup Mirror für Freunde
- Eingehende Daten sind vor dem Versand verschlüsselt
- Nur die letzte Version wird gespeichert


## VPN

- OpenVPN einwahl in den eigenen Haushalt
- IOS, Android und MacOS client

## internes Netzwerk neu gestalten

IoT Geräte:
- WPA2, VLAN Tagging für IOT Geräte mit iptables und Regelwerk pro Gerät
- MacAdress Filter
- Static DHCP

Gast Netzwerk
- WPA2, WPA3
- Bandbreitenlimitierung pro Gerät
- Passwort pro Gerät / ggfls oauth oder [https://www.keycloak.org/](keycloak)

## interner OAuth Server

- zur Absicherung von internen Web Apps
- als WLAN Authorisierung

## Freiwillige Selbstkontrolle für Kinder

- Erfassung der Datenkommunikationsdauer
- jeden Tag, beim ersten verbinden anzeige der Top 5 (z.b. minecraft, youtube)
- Eingabefeld für Dauerschätzung
- nach der Eingabe erfolgt die Anzeige der tatsächlichen Dauer
- Freischaltung des Internetzugangs nachdem die jeweilige Differenz ausgerechnet wurde
- Wochenbericht per mail mit Grafik für Schätzung vs Realität

## Einkaufsliste / Inventar / Verbrauch

- Einkausliste für Familie
- Inventar Management - min. Menge von zb. Spaghetti
- Barcode scan von gekauften Waren
- Barcode scan bei Verbrauch?

Links:
- [https://grocy.info/](Grocy.info)

## Raspberry Server Cluster
Mit zunehmender integration wird die Verfügbarkeit wichtiger, insbesondere wenn statt nur Metriken bereit zu stellen auch Dinge gesteuert werden sollen.

- auth server im cluster modus
- mosquitto
- interne webabpplikationen redundant deployen
- Grafana
- WLAN AP / DHCP / DNS


