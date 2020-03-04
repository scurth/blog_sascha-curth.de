---
title: Raspberry Pi 2/3/4 als WLAN AccessPoint 
description: Die Grundlage aller IoT Integrationen bildet ein sicheres, funktionsfähiges WLAN und der RaspberryPi 2/3/4, in Verbindung mit Linux, bietet hierfür eine geeignet Grundlage.
introimage: "/images/wifi.png"
author: Sascha Curth
type: article
lang: de-DE
published: 03.03.2020
modified: 04.03.2020
---
#  Raspberry Pi 2/3/4 als WLAN AccessPoint
<TOC />

## In einem Satz
Die Grundlage aller IoT Integrationen bildet ein sicheres, funktionsfähiges WLAN und der RaspberryPi 2/3/4, in Verbindung mit Linux, bietet hierfür eine geeignet Grundlage.

## Überblick
Für die Konfiguration werden <b>hostapd</b> als Accesspoint verwendet und <b>dnsmasq</b> als einfacher DHCP server. Das WLAN wird ausschliesslich als Accesspoint genutzt und der RaspberryPi entsprechend via Netzwerkkabel angeschlossen.

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
# Country code (ISO/IEC 3166-1). Used to set regulatory domain.
# Set as needed to indicate country in which device is operating.
# This can limit available channels and transmit power.
# These two octets are used as the first two octets of the Country String
# (dot11CountryString)
country_code=DE
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

### RaspberryPi 2
Da diese Hardware Revision noch nicht über eine eingebaute WIFI Schnittstelle verfügt, muss ein USB WLAN Adapter verwendet werden, welcher den WLAN-AP Modus anbietet. Mit dem aktuellen Raspbian OS funktionieren folgende Adapter ohne weitere Anpassungen:
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
## WLAN Kanal optimieren
Das WLAN Spektrum besteht aus mehreren Frequenzen zur Reduktion von Funküberlagerungen. Die meisten IoT Geräte unterstützen nur 2.4GHz Kanäle, während moderne Handys und Notebooks überlicherweise zusätzlich die 5GHz Kanäle zusätzlich unterstützen. 
>**TIPP**
>
>Normales Datennetz auf einen 5GHz Kanal konfigurieren und die IoT Geräte / IoT WLAN Accesspoint auf einen 2.4GHz Kanal einstellen.

```shell
# iwlist wlan0 scan | grep 'Frequency:2.462 GHz' | sort | uniq -c
      2                     Frequency:2.462 GHz (Channel 11)
```
Die konfigurierbaren Kanäle werden mit dem <b>iw</b> Tool dargestellt.
```shell
# iw list| grep '* 24[0-9]\{2\} MHz'
			* 2412 MHz [1] (20.0 dBm)
			* 2417 MHz [2] (20.0 dBm)
			* 2422 MHz [3] (20.0 dBm)
			* 2427 MHz [4] (20.0 dBm)
			* 2432 MHz [5] (20.0 dBm)
			* 2437 MHz [6] (20.0 dBm)
			* 2442 MHz [7] (20.0 dBm)
			* 2447 MHz [8] (20.0 dBm)
			* 2452 MHz [9] (20.0 dBm)
			* 2457 MHz [10] (20.0 dBm)
			* 2462 MHz [11] (20.0 dBm)
			* 2467 MHz [12] (disabled)
			* 2472 MHz [13] (disabled)
			* 2484 MHz [14] (disabled)
```
In dem Beispiel sind 
- 2 SSIDs/WLAN Netze auf dem Kanal 11 sichtbar
- die Kanäle 1 bis 14 technisch verfügbar
- die Kanäle 1 bis 11 aufgrund der gewählten "country_code" Einstellung verwendbar

Da in einem anderen Teil des Hauses der Kanal 1 von diversen Nachbar WLANs benutzt ist, habe ich mich für den Kanal 2 entschieden.

Die reine Anzahl der bestehenden WLAN Accesspoints gibt noch keine Auskunft über die aktuelle Nutzung in bezug auf den Datendurchsatz, aber komplett freie Kanäle sind immer einge gute Wahl. Den gewünschten Kanal konfiguriert man dann in der <b>/etc/hostapd/hostapd.conf</b> unter <b>channel</b>.

Da neue Netze durch Nachbarn hinzukommen können, empfiehlt es sich die aktuelle Auslastung zu überwachen, z.b. durch einen cronjob/mail oder kontinuierlich via MQTT und Visualisierung und Alarmierung durch Grafana.
```shell
iwlist wlan0 scan | grep 'Frequency:2.462 GHz (Channel 11)'|uniq -c
      2   Frequency:2.462 GHz (Channel 11)
```

## WLAN Reichweite einstellen
Die aktuellen Eintellungen kann man mittels iwconfig auslesen und werden in diesem Beispiel von 31 dBm auf 1 dBm gesetzt um das WLAN nicht unnötig weit sichtbar zu machen. Das Deaktivieren des SSID Broadcast kann auch eine hilfreiche Maßnahme sein, jedoch wird dadurch weiterhin mit voller Sendeleistung gearbeitet und die Kommunikation kann theoretisch weiter entfernt belauscht werden.
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

