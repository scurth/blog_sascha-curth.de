---
title: Tasmota Firmware
description: Installation der OpenSource Firmware
introimage: "/images/tasmota.png"
author: Sascha Curth
type: article
lang: de-DE
published: 22.02.2020
modified: 10.03.2020
---
# Was ist Tasmota und warum sollte man diese Firmware nutzen
Tasmota ist eine kostenlose alternative Firmware für Geräte die auf dem ESP8266 Chip basieren, das sind solche von Sonoff und vielen weiteren Herstellern. Tasmota befreit deine Geräte von undurchsichtiger Software und ermöglicht so die Geräte ohne Cloud Komponenten und Internetanbindung zu betreiben und dein Smarthome und Zuhause zu vereinfachen.

## Welche Geräte werden unterstützt
TBD: https://templates.blakadder.com/


## Tasmota OTA - Over The Air - Flash
TBD: https://github.com/ct-Open-Source/tuya-convert

## Backup der Tasmota Konfiguration
Die Konfiguration kann man via http://IP des Geräts/dl laden oder mittels decode-config.

>**decode-config**
> Convert, backup and restore configuration data of devices flashed with Tasmota firmware.

```shell
git clone https://github.com/tasmota/decode-config
cd decode-config
./decode-config.py -d 192.168.20.76 --backup-file Config-@H-@f-@v --backup-type json
ls Config-*
Config-tasmota-7658-Tasmota-8.1.0.2.json
```

```shell
for ip in `arp -a|grep tasmota| awk '{print $2}' | tr -d '(' |tr -d ')'`; do ./decode-config.py -d ${ip} --backup-file Config-@H-@f-@v --backup-type json; done
ls Config-tasmota-*
Config-tasmota-0516-Tasmota-8.1.0.2.json  Config-tasmota-BAF2DB-4827-BlitzWolf-SHP6-15A-7.1.1.json  Config-tasmota-BAFFD4-8148-BlitzWolf-SHP6-15A-7.1.1.json
Config-tasmota-2356-Tasmota-8.1.0.2.json  Config-tasmota-BAF821-6177-BlitzWolf-SHP6-15A-7.1.1.json
Config-tasmota-7658-Tasmota-8.1.0.2.json  Config-tasmota-BAFBCD-7117-BlitzWolf-SHP6-15A-7.1.1.json
```
