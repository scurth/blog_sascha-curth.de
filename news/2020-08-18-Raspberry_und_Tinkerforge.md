---
title: Raspbian Kernel Update & Tinkerforge HAT
description: Der brickd startet nach Kernel Upgrade auf 5.4 nicht mehr
introimage: "/images/tinkerforge.jpg"
type: news
lang: de-DE
published: 18.08.2020
---
# {{ $frontmatter.title }}
<TOC />

##  In einem Satz
Das Raspberry OS / Raspbian wird vom Kernel 4.9 auf 5.4 aktualisert und damit funktioniert der Raspberry HAT nicht mehr, wenn die Firmware kleiner 2.0.2 ist.

## Kontext
Linux entwickelt sich weiter und Kernel Upgrades sind ein notwendiger Teil. Nach dem Kernel Upgrade startet der Tinkerforge Brickd (Version 2.4.1) nicht mehr und meldet folgendes:

```shell
2020-08-18 11:17:26.944215 <E> <gpio_sysfs.c:129> Could not open '/sys/class/gpio/gpio7/direction': ENOENT (2)
2020-08-18 11:17:26.944879 <W> <hardware.c:56> Still 6 stack(s) connected
2020-08-18 11:17:26.945067 <W> <event.c:138> Leaking generic event source (handle: 17, name: bricklet-stack-notification, events: 0x0001) at index 0
2020-08-18 11:17:26.945128 <W> <event.c:138> Leaking generic event source (handle: 20, name: bricklet-stack-notification, events: 0x0001) at index 1
2020-08-18 11:17:26.945165 <W> <event.c:138> Leaking generic event source (handle: 23, name: bricklet-stack-notification, events: 0x0001) at index 2
2020-08-18 11:17:26.945203 <W> <event.c:138> Leaking generic event source (handle: 26, name: bricklet-stack-notification, events: 0x0001) at index 3
2020-08-18 11:17:26.945248 <W> <event.c:138> Leaking generic event source (handle: 29, name: bricklet-stack-notification, events: 0x0001) at index 4
2020-08-18 11:17:26.945284 <W> <event.c:138> Leaking generic event source (handle: 32, name: bricklet-stack-notification, events: 0x0001) at index 5
2020-08-18 11:17:26.945328 <I> <main_linux.c:538> Brick Daemon 2.4.1 stopped
```

Offensichtlich geht der neue Kernel anders mit den GPIOs um und die installerte Firmware 2.0.1 des Raspberry HAT kann damit nicht umgehen.

## Lösung
Eine SD Karte mit dem default Raspian installieren, welche noch mit Kernel 4.9 ausgeliefert wird. Nachdem das Image auf die Karte geschrieben ist, noch einmal mounten und eine leere Datei namens "ssh" nach /boot legen. Dadurch wird beim ersten Bootvorgang gleich der SSH Daemon initialisiert.

Unter MacOS ist die SD Karte unter /Volumes eingebunden:

```shell
touch /Volumes/boot/ssh
```

Jetzt den Raspi mit der temporären SD Karte neu starten, via ssh verbinden und den Brickd installieren:
```shell
wget https://download.tinkerforge.com/tools/brickd/linux/brickd_linux_latest_armhf.deb
sudo dpkg -i brickd_linux_latest_armhf.deb
```

Danach kann man sich mittels brick viewer verbinden, die Firmware auf mindestens 2.0.2 aktualiseren und anschliessend mit dem ursprünglichen Boot Gerät wieder starten. 

## Fazit
Ist nicht so toll plötzlich nicht mehr auf den HAT und die Geräte zurgreifen zu können, aber grosses Lob an den Tinkerforge Support für eine sehr schnelle Reaktion.
[https://www.tinkerunity.org](https://www.tinkerunity.org/topic/5513-hat-brick-brickd-startet-nicht/?tab=comments#comment-30209)

