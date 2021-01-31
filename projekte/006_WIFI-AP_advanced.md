---
title: Heim WiFi mit nutzerbasierten Zugangsdaten
description: Heim WiFi mit nutzerbasierten Zugangsdaten
introimage: "/images/projekte/wireless-1289347_640.png"
type: projekte
lang: de-DE
published: 03.05.2020
sitemap:
  exclude: false
  changefreq: monthly
---
# Heim WiFi mit nutzerbasierten Zugangsdaten
<TOC />

---
**HINWEIS 25.01.2021**

Ich verwende kein EAP mehr, sondern pre-shared-keys (PSK), pro Endgerät bzw für das Gäste WLAN einen PSK für mehrer Clients.

Neues Projekt: [Das (fast) perfekte Heimnetzwerk für das Jahr 2021](https://www.sascha-curth.de/projekte/010_perfektes_netzwerk_2021.html)

---

## Problemstellung
Ein WiFi Netzwerk mit einem geteilten Standard Passwort funktioniert, allerdings ist das wechseln des Passworts ein erheblicher Aufwand. Wenn beispielsweise ein Schalter defekt ist und zurück geschickt werden muss, müsste idealerweise das heimische PAsswort geändert werden, da man nicht wissen kann ob der Hersteller die Konfiguration auslesen kann. Das würde jedoch eine Arbeit nach sich ziehen da diese Änderung auf allen Geräten die noch im Haushalt sind durchgeführt werden muss.

Ein Inventar über vorhandene Geräte und eine abgleich der verbundnen vs derzeit nicht verbundenen eröffnet weiter Möglichkeiten und kann ähnlich auf das Gäste Netzwerk angewendet werden. 

- gezieltes deaktivieren einzelner Geräte
- Netzwerk Nutzung überwachen und limitieren
- Alarmierung bei "verschwinden" von Geräten oder unüblicher Aktivität

## These
Aufbauend auf voerherigen Systemen, basierend auf dem raspberry und hostapd, kann die Konfiguration auf eine individuelle Authentifizierung umgestellt werden. Da der raspberry 3 WiFi Chip nicht "AP/VLAN" unterstützt, muss ein USB-WiFi-Adapter verwendet werden.

Dazu sind folgenden Komponenten notwendig:

- Ralink RT5370 Wireless Adapter
- hostapd
- freeradius
- iptables

## Experiment

### on-board WLAN abschalten

/etc/modprobe.d/raspi-blacklist.conf 
```shell
# WLAN abschalten
blacklist brcmfmac
blacklist brcmutil
```

### Grundsetup 

Im Kompendium [Artikel](/kompendium/004_Raspberry_WIFI_Access_Point.html) ist der grundsätzliche Aufbau beschrieben und ist die Basis für das aktuelle Projekt.

/etc/hostapd/hostapd.conf 
```shell
################
# Anpassen     #
################
# Netzwerk Name
ssid=<WLAN Netzwerkname"
# Das Netzwerk Passwort
wpa_passphrase=<mind 8 Zeichen>
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

Der Ralink RT5370 Wireless Adapter unterstützt nicht "ht_capab=[HT40][SHORT-GI-20][DSSS_CCK-40]", weshalb es erstmal aus der Konfiguration entfernt wird.

/etc/network/interfaces
```shell
...
auto wlan0
iface wlan0 inet static
  address 192.168.100.1
  netmask 255.255.255.0
...
```

grep -v '#' /etc/dnsmasq.conf |sort -u
```shell
bind-interfaces
bogus-priv
dhcp-range=192.168.100.10,192.168.100.150,12h
domain-needed
interface=wlan0
listen-address=192.168.100.1
no-dhcp-interface=eth0
no-poll
no-resolv
server=8.8.4.4@eth0
server=8.8.8.8@eth0
```

Jetzt kann das neuer WLAN gestest werden und mit sollte mit dem angegebenen, statischem Passwort funktionieren.

### FreeRadius Integration

```shell
apt-get install freeradius
```

In der /etc/freeradius/3.0/users folgende Zeile einfügen und freeradius neu starten:

username_1 Cleartext-Password := "password_1"

Im Anschluss username/passwort testen:
```shell
radtest username_1 password_1 127.0.0.1 0 testing123
Sent Access-Request Id 11 from 0.0.0.0:53999 to 127.0.0.1:1812 length 80
	User-Name = "username_1"
	User-Password = "password_1"
	NAS-IP-Address = 127.0.1.1
	NAS-Port = 0
	Message-Authenticator = 0x00
	Cleartext-Password = "password_1"
Received Access-Accept Id 11 from 127.0.0.1:1812 to 127.0.0.1:53999 length 20
```

Als nächstes wird die hostapd.conf angepasst:

```shell
################
# Anpassen     #
################
# Netzwerk Name
ssid=<WLAN Netzwerkname"
# Das Netzwerk Passwort
# wpa_passphrase=<mind 8 Zeichen>  <---- das wird auskommentiert
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
#ht_capab=[HT40][SHORT-GI-20][DSSS_CCK-40]
# Alle MAC Adressen aktzeptieren
macaddr_acl=0
# WPA authentifizierung
auth_algs=1
# Clients müssen die SSID wissen
ignore_broadcast_ssid=0
# WPA2 aktivieren
wpa=2
# Einen pre-shared key verwenden
#wpa_key_mgmt=WPA-PSK  <---- das wird auskommentiert
# AES verwenden
rsn_pairwise=CCMP
################################
# FreeRadius                   #
################################
ieee8021x=1
wpa_key_mgmt=WPA-EAP
auth_server_addr=127.0.0.1
auth_server_port=1812
auth_server_shared_secret=testing123
eap_reauth_period=30 <---reauth alle 30 sekunden, nur während der tests, später entsprechend anpassen
```

Nach dem Neustarten des *hostapd* kann der Nutzer "username_1" sich mit dem WiFi Netzwerk unter der Angabe des Passworts "password_1" verbinden.

## Komforterhöhung

Nachdem das Experiment gelungen ist und mehrere Nutzer mit eigenen Zugangsdaten das WLAN nutzen können, 

- Nutzerauthentifizierung über Datenbank
- VLAN Setup zur Isolierung der einzelnen Nutzer
- Nutzer Netzwerknutzung protokollieren 
- Eigenes TLS Zertifikat freeradius/hostapd

## Vorbereitung
- WLAN IP: 192.168.100.1
- WLAN DHCP Range: 192.168.100.10 - 192.168.100.250
- WLAN SSID: SerenityNG
- Upstream DNS: 8.8.8.8, 8.8.4.4 


