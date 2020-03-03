---
title: Raspberry Pi 2/3/4 als WLAN AccessPoint 
description: Die Grundlage aller IoT Integrationen bildet ein sicheres, funktionsfähiges WLAN und der RaspberryPi 2/3/4, in Verbindung mit Linux, bietet hierfür eine geeignet Grundlage.
introimage: "/images/wifi.png"
author: Sascha Curth
type: article
lang: de-DE
published: 04.03.2020
modified: 04.03.2020
---
#  Raspberry Pi 2/3/4 als WLAN AccessPoint
<TOC />

## In einem Satz
Die Grundlage aller IoT Integrationen bildet ein sicheres, funktionsfähiges WLAN und der RaspberryPi 2/3/4, in Verbindung mit Linux, bietet hierfür eine geeignet Grundlage.

## Überblick
Für die Konfigurations einen WLAN Accespoints werden <b>hostapd</b> als Accesspoint verwendet und <b>dnsmasq</b> als einfacher DHCP server. Das WLAN wird ausschliesslich als Accesspoint genutzt und er RaspberryPi entsprechend via Netzwerkkabel angeschlossen.

## Quick & Dirty
```shell
sudo apt-get install hostapd dnsmasq
```

/etc/hostapd/hostapd.conf
```shell
################
# Anpassen     #
################
# Netzwerk Name
ssid=<SSID>
# Das Netzwerk Passwort
wpa_passphrase=<min. 8 Zeichen>
#############################
# Keine Anpassung notwendig #
#############################
# Wlan Interface
interface=wlan0
# Den nl80211 Treiber verwenden
driver=nl80211
# 2.4GHz verwenden
hw_mode=g
# Channel einstellen z.B. 6 (1-13)
channel=2
# 802.11n aktivieren
ieee80211n=1
# 40MHz channels mit 20ns guard Interval
ht_capab=[HT40][SHORT-GI-20][DSSS_CCK-40]
# Alle MAC Adressen aktzeptieren
macaddr_acl=0
# WPA authentifizierung
auth_algs=1
# Clients müssen die SSID wissen
ignore_broadcast_ssid=0
# WPA2 aktivieren
wpa=2
# Einen pre-shared key verwenden
wpa_key_mgmt=WPA-PSK
# AES verwenden
rsn_pairwise=CCMP
```

/etc/network/interfaces
```shell
auto wlan0
iface wlan0 inet static
            address 192.168.20.1
            netmask 255.255.255.0
```

Hostapd service aktivieren
```shell
sudo systemctl enable hostapd
sudo service networking restart
sudo service hostapd restart
```

Jetzt kann man sich mit dem neuen WLAN verbinden und sollte eine IP Adresse zugewiesen bekommen.

>**TIPP**
>
>Nach der erfolgreichen Änderung von Netzwerkeinstellungen ist es empfehlenswert das System neuzustarten, um sicher zu stellen das alle Komponenten automatisch starten.

## RaspberryPi 2
Da diese Hardware Revision noch nicht über eine eingebaute WIFI Schnittstelle muss ein USB WLAN Adapter verwendet werden. Es wird ein USB Wifi Stick benötigt, welcher unter Linux unterstützt wird und WLAN-AP Modus anbietet. Mit dem aktuellen Raspbian OS funktionieren folgende Adapter:
- Ralink RT5370 Chipsatz (unter 10€)

Mit diesem Chip muss hostapd mit einem Patch neu kompiliert werden:
- EDIMAX EW-7811UN

Um zu prüfen ob der AP Mode unterstützt wird is das <b>iw</b> tool hilfreich.
```shell
# iw list
...
	Supported interface modes:
		 * IBSS
		 * managed
		 * AP
		 * P2P-client
		 * P2P-GO
		 * P2P-device
...
```

## WLAN Reichweite einstellen
Die aktuellen Eintellungen kann man mittels iwconfig auslesen und werden in diesem Beispiel von 31 dBm auf 1 dBm gesetzt um das WLAN nicht unnötig weit sichtbar zu machen. Das deaktivieren des SSID Broadcast kann auch eine hilfreiche Maßnahme sein, jedoch wird dadurch weiterhin mit voller Sendeleistung gearbeitet und die Kommunikation kann theoretisch wetier entfertn belauscht werden.
```shell
# iwconfig wlan0 
wlan0     IEEE 802.11  Mode:Master  Tx-Power=31 dBm   
          Retry short limit:7   RTS thr:off   Fragment thr:off
          Power Management:on

# iwconfig wlan0 txpower 1
# iwconfig wlan0 
wlan0     IEEE 802.11  Mode:Master  Tx-Power=1 dBm   
          Retry short limit:7   RTS thr:off   Fragment thr:off
          Power Management:on
```
Um diese Änderung auch nach einem Reboot zu behalten kann ein "post-up" Befehl verwendet werden.

/etc/network/interfaces
```shell
auto wlan0
iface wlan0 inet static
            address 192.168.20.1
            netmask 255.255.255.0
            post-up /sbin/iwconfig wlan0 txpower 1
```

## Lokale Services und Internet Zugang
Ohne IP Forwarding und NAT Konfiguration können die WLAN Teilnehmer sich nicht ins Internet verbinden, aber auf Dienste zugreifen, welche am wlan0 des RaspberryPi konfiguriert sind. 

