---
title: Tasmota Firmware
description: Installation der OpenSource Firmware
introimage: "/images/tasmota.png"
type: article
lang: de-DE
published: 22.02.2020
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
for ip in `arp -a|grep tasmota| awk '{print $2}' | tr -d '(' |tr -d ')'`;
do 
  ./decode-config.py -d ${ip} --backup-file Config-@H-@f-@v --backup-type json;
done

ls Config-tasmota-*
Config-tasmota-0516-Tasmota-8.1.0.2.json  Config-tasmota-BAF2DB-4827-BlitzWolf-SHP6-15A-7.1.1.json  Config-tasmota-BAFFD4-8148-BlitzWolf-SHP6-15A-7.1.1.json
Config-tasmota-2356-Tasmota-8.1.0.2.json  Config-tasmota-BAF821-6177-BlitzWolf-SHP6-15A-7.1.1.json
Config-tasmota-7658-Tasmota-8.1.0.2.json  Config-tasmota-BAFBCD-7117-BlitzWolf-SHP6-15A-7.1.1.json
```

## Tasmota OTA Firmware Update
Beim aktualisieren der Tasmota Firmware auf eine aktuellere Version muss man den kompletten [Update Pfad](https://tasmota.github.io/docs/#/Upgrading?id=migration-path) befolgen. Die Tasmota Firmware ist auch in verschienden Sprachunterstützungen verfügbar, ich bevorzuge die englische Variante.

- aktuelle Version und Zielvesion herausfinden - [Tasmota Github](https://github.com/arendst/Tasmota/releases)
- alle Zwischenvarianten herunterladen, als "minimal" und als "richtiges" Image
- Backup der aktuellen Konfiguration erzeugen
- installation der "minimal" Variante, gefolgt von dem richtigen Versions Image

Der Zwischenschritt über das minimal image ist notwendig, da der Speicher nicht ausreicht für den Upgrade und folgende Fehlermeldung resultiert. 

```shell
Upload fehlgeschlagen
Upload-buffer-Vergleich weicht ab
```

Beispiel Update Pfad von 7.1.1 auf 8.2.0

- [7.2.0-minimal](https://github.com/arendst/Tasmota/releases/download/v7.2.0/tasmota-minimal.bin)
- [7.2.0](https://github.com/arendst/Tasmota/releases/download/v7.2.0/tasmota.bin)
- [8.5.1-minimal](https://github.com/arendst/Tasmota/releases/download/v8.5.1/tasmota-minimal.bin)
- [8.5.1](https://github.com/arendst/Tasmota/releases/download/v8.5.1/tasmota.bin)
- [9.1.0-minimal](https://github.com/arendst/Tasmota/releases/download/v9.1.0/tasmota-minimal.bin)
- [9.1.0](https://github.com/arendst/Tasmota/releases/download/v9.1.0/tasmota.bin)

Automatisches herunterladen
```shell
for version in "7.2.0" "8.5.1" "9.1.0"
do
  curl -L https://github.com/arendst/Tasmota/releases/download/v${version}/tasmota-minimal.bin -o tasmota-minimal-${version}.bin
  curl -L https://github.com/arendst/Tasmota/releases/download/v${version}/tasmota.bin -o tasmota-${version}.bin
done
``` 

Bei dem beschriebene Upgrade Pfad wurde meine Konfiguration nicht beschädigt und war ohne weiteres zutun benutzbar.

## Tasmota Reset

Es kann vorkommen, das sich eine Tasmota Steckdose aufhängt und sich nicht mehr bedienen lässt. Um diese wieder zum Leben zu erwecken kann man die sogenannte "Fast Power Cycle Device Recovery" Prozedur durchführen. Hierbei wird die Steckdose für mind. 30 Sekunden vom Strom getrennt und anschliessend für max. 10 Sekunden verbunden und wieder getrennt. Dieser Schritt muss 6 mal wiederholt werden und beim 7. Mal lässt man den Strom verbunden. Danach wird automatisch der Access Point gestartet und man kann das Gerät wieder neu konfigurieren. Die gleiche Prozedur kann auch genutzt werden, wenn sich die WLAN SSID oder das Passwort verändert haben und das Gerät nicht automatisch im AP Modus startet.

Um es zu vereinfachen, kann man auch eine zweite Tasmota Steckdose nehmen, die defekte dort hineinstecken und auf der funktionstüchtigen über die Web Console folgende Kommandos reinkopieren:

```
Backlog Power1 off; Delay 350;
Power1 on; Delay 50; Power1 off; Delay 50;
Power1 on; Delay 50; Power1 off; Delay 50;
Power1 on; Delay 50; Power1 off; Delay 50;
Power1 on; Delay 50; Power1 off; Delay 50;
Power1 on; Delay 50; Power1 off; Delay 50;
Power1 on; Delay 50; Power1 off; Delay 50;
Power1 on;
```

Über den Parameter "Backlog" werden die nachfolgenden Kommandos automatisch im Hintergrund ausgeführt. Der Delay Parameter 350 bedeutet 35 Sekunden warten. Den kompletten Block kopieren und mit einem Mal einfügen.

