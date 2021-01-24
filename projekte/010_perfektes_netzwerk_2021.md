---
title: Das (fast) perfekte Heimnetzwerk für das Jahr 2021
description: In diesem Artikel zeige ich wie man mit opensource Komponenten ein sicheres, performantes und erweiterbares Netzwerk aufbaut.
introimage: "/images/projekte/security-2688911_640.jpg"
type: projekte
lang: de-DE
published: 20.01.2021
---
# {{ $frontmatter.title }}
![L1](/images/projekte/security-2688911_640.jpg)
<TOC />


## Problemstellung

Ein verlässliches, sicheres und performantes Heimnetzwerk ist die Grundlage nicht nur aller IoT Geräte, sondern auch des normalen Lebens heutzutage. Insbesondere Home Office und Home Schooling bringen hohe Anforderungen. Während es im kommerziellen Bereich recht gute Geräte gibt, mit denen man diese Anforderungen abdecken kann, sind die Geräte für Endwanwender oft nur bedingt geeignet.

Während der letzten Monate arbeiten meine Frau und ich von zuhause, mit entsprechend vielen Videokonferenzen und zusätzlich benötigen unsere Kinder zur gleichen Zeit Internet Zugang. Ein Ausfall des Internetzugangs ist entsprechend nervig. Weder MacOS, Linux, noch Windows sind per se sicher oder unsicher. Es ist mir wichtig, sicherzustellen, dass die Arbeitsrechner weder auf irgendwelche internen Geräte zugreifen können, noch irgendein internes Gerät einen Arbeitsrechner erreichen kann. Ich denke niemand will auf Arbeit erklären müssen, dass z.b.ein Virus / Trojaner aus dem eigenen Netzwerk den Arbeitsrechner befallen hat und anschliessend irgendwelche Firmendaten verschlüsselt oder vernichtet wurden.

Da meine Internetanbindung ein Privat und kein Geschäftskunden Tarif ist, ist die Verfügbarkeitsgarantie von Vodafone entsprechend. Im Falle eines Ausfalls, möchte ich den Internetzugang über ein LTE Modem transparent zur Verfügung stellen. Hier ist das Volumen pro Monat allerdings begrenzt und dementsprechend soll diese Verbindung nur im Ernstfall genutzt werden und bestimmte Geräte, wie z.b. der Fernseher nicht darüber ins Internet gehen.

## Ausgangslage

Seit mehreren Jahren verwende ich als WLAN Accesspoint einen Raspberry mit "hostapd" und um das ganze Haus abzudecken einen Fritz! Repeater. Der Repeater arbeitet im 5GHz Bereich, während mein Accesspoint das 2,4GHz Netz verwendet. Dadurch kommt es nicht zu Bandbreiten Einschränkungen, aber der Durchsatz ist gerade so ok und der Repeater muss auch alle paar Wochen mal neugestartet werden. Generell bin ich mit dem Raspberry/Raspian/Hostapd sehr zufrieden, aber hier wird es auch Zeit für einen upgrade auf Raspbery 4, insbesondere weil der aktuelle nur 1GB RAM hat und ich diverse Dienste dort nicht betreiben kann. Repeater sind meiner Meinung nach keine gute Wahl, insbesondere wenn man strukturierte Verkabelung im Haus zur Verfügung hat. Gegen die Verwendung eines Mesh Netzwerk habe ich mich aus dem gleichen Grund entschieden. Sollte keine Netzwerkverkabelung vorhanden sein, ist das aber durchaus eine Option.

## Geräte Risiko Klassen

Basierend auf dem jeweiligen Anwendungsgebiet, habe ich in meinem Haushalt folgende Geräte/Zugriffsklassen identifiziert:

### Gäste via WiFi / WLAN
Diese Geräte sind als nicht vertraunswürdig zu betrachten und daher

- Zugangsdaten regelmäßig aktualiseren
- einfaches zur Verfügung stellen der aktuellen Schlüssel (QR-Code)
- Gästegeräte dürfen nur auf Resourcen im Internet zugreifen
- kein Zugriff auf andere Geräte im gleichen Netzwerk oder Dienste in anderen meiner Netzwerke

### IoT WiFi (Tasmota)
Diese Geräte sind bedingt vertrauenswürdig.

- individuelle Zugangsdaten pro Gerät
- Zugriff auf meinen MQTT Bus für Metriken und Steuerungen
- kein Zugriff auf Internet Resourcen
- kein Zugriff auf andere Geräte in meinem Netzwerk
- voller Zugriff auf die IoT Geräte aus meinem Admin Netzwerk

### Admin Netzwerk
Diese Geräte sind das größte Risiko für die Sicherheit, da unbegrenzter Zugriff.

- individuelle Zugangsdaten pro Gerät
- Zugriff auf all Netzwerk Resourcen
- Zugriff auf das Internet

### Bosch Home Connect
Diese Geräte sind ein interessanter Sonderfall, da sie sich zum Internet verbinden müssen, aber gleichzeitig für die Einrichtung in der Home Connect App auch das Handy erreichen müssen. Das Handy mit der entsprechenden App muss sich dabei im gleichen Subnetz befinden.

- Individuelle Zugangsdaten pro Gerät
- Zugriff auf das Internet
- Zugriff auf IPs im gleichen Subnetz
- kein Zugriff auf andere interne Resourcen

### Ethernet / LAN
Diverse Geräte sind über Netzwerkkabel an meine Switche angebunden und ich habe mich entscheiden erstmal die Switche zu behalten, werde aber vermulich in Zukunft in einen neuen investieren.

- Zugriff auf interne Resourcen und Internet via iptables moderieren

## Hardware

### Haupt-Raspberry

- Raspberry Pi 4 / 8GB RAM
- 120 GB SSD
- Ralink Technology, Corp. RT5370 Wireless Adapter
- DELOCK 62966 Netzwerkadapter, USB 3.0, Gigabit Ethernet, 4 x RJ45
- ICY BOX IB-HUB1703-QC3 7-fach USB 3.0 Industrie Hub mit Netzteil
- Netgear LB2120-100PES 4G LTE Modem

### 2 x WLAN Erweiterung

- Raspberry 3 / 1GB RAM, Netzteil
- Ralink Technology, Corp. RT5370 Wireless Adapter
- keine SD-karte oder SSD, da Netzwerk PXE boot / NFS

## Netzwerk Layout

Zur Vereinfachung verwende ich im folgenden folgende Namen:

- homeberry (der Raspberry 4, der als Gateway, iptables filter, etc fungiert)
- apberry0x (raspberry als WLAN Erweiterung)

### Netzwerkverbindungen

```
homeberry eth0: Vodafone Kabelmodem -> Internet
homeberry eth1: LTE Modem -> Internet
homeberry eth2: 24 Port 100Mbit Switch
homeberry eth3: 8 Port GBit Switch
homeberry eth4: devolo DLan Netzwerk
homeberry wlan0: onboard WLAN Chip (deaktiviert, ausser für WLAN scans)
homeberry wlan1 Admin : RaLink RT5370 für die Bereitstellung der WLAN Accesspoints
homeberry wlan1_0 Gäste WLAN : RaLink RT5370 für die Bereitstellung der WLAN Accesspoints
homeberry wlan1_1 IoT : RaLink RT5370 für die Bereitstellung der WLAN Accesspoints
homeberry wlan1_2 Bosch : RaLink RT5370 für die Bereitstellung der WLAN Accesspoints
```

```
apberry01 eth0: Verbunden mit dem 8 Port Gbit Switch
apberry01 wlan0: onboard WLAN Chip (deaktiviert, ausser für WLAN scans)
apberry01 wlan1 Admin : RaLink RT5370 für die Bereitstellung der WLAN Accesspoints
apberry01 wlan1_0 Gäste WLAN : RaLink RT5370 für die Bereitstellung der WLAN Accesspoints
apberry01 wlan1_1 IoT : RaLink RT5370 für die Bereitstellung der WLAN Accesspoints
apberry01 wlan1_2 Bosch : RaLink RT5370 für die Bereitstellung der WLAN Accesspoints
```

```
apberry02 eth0: Verbunden mit dem 8 Port Gbit Switch
apberry02 wlan0: onboard WLAN Chip (deaktiviert, ausser für WLAN scans)
apberry02 wlan1 Admin : RaLink RT5370 für die Bereitstellung der WLAN Accesspoints
apberry02 wlan1_0 Gäste WLAN : RaLink RT5370 für die Bereitstellung der WLAN Accesspoints
apberry02 wlan1_1 IoT : RaLink RT5370 für die Bereitstellung der WLAN Accesspoints
apberry02 wlan1_2 Bosch : RaLink RT5370 für die Bereitstellung der WLAN Accesspoints
```

## Wichtige Grundlagen

### Auswahl des WLAN Adapters

Neben der generellen Unterstützung durch Linux / Hostapd ist es wichtig, das der Chipsatz folgende Dinge unterstützt:

- Accesspoint Modus
- configuring vdev MAC-addr on create.
- der notwendige WLAN Standard

```shell
iw phy1 info| grep "Device supports configuring vdev MAC-addr on create."
	Device supports configuring vdev MAC-addr on create.

iw phy1 info| grep "AP"
		 * AP
		 * AP/VLAN
		 * AP: 0x00 0x10 0x20 0x30 0x40 0x50 0x60 0x70 0x80 0x90 0xa0 0xb0 0xc0 0xd0 0xe0 0xf0
		 * AP/VLAN: 0x00 0x10 0x20 0x30 0x40 0x50 0x60 0x70 0x80 0x90 0xa0 0xb0 0xc0 0xd0 0xe0 0xf0
		 * AP: 0x00 0x20 0x40 0xa0 0xb0 0xc0 0xd0
		 * AP/VLAN: 0x00 0x20 0x40 0xa0 0xb0 0xc0 0xd0
		 * AP/VLAN
		 * #{ AP, mesh point } <= 8,
	Device supports AP scan.
```

### WLAN Standards 802.11 b/g/ac/ax

- 802 steht für den Februar (2) des Jahres 1980, indem das „Institute of Electrical and Electronics Engineers“ (IEEE) den einheitlichen WLAN-Standard veröffentlichte.
- .11 ist eine Normenfamilie für WLAN-Netzwerke.
- der dahinter folgende Buchstabe (a, b, g, n, ac, ax) des WLAN-Standards, der u.a. über die maximale Geschwindigkeit und die verwendete Frequenz bestimmt.

Zusammengeführt: IEEE 802.11 a/b/g/n/ac.

Generell arbeiten die meisten IoT Geräte im 2.4GHz Bereich und unterstützen üblicherweise b/g/n.

Weitere Details zu den Standards findet man auf [wikipedia](https://de.wikipedia.org/wiki/IEEE_802.11)

### hostapd Einschränkungen / Limitierungen

Wenn man mit dem hostapd mehrere virtuelle Accesspoints betreibt, können bestimmte Konfigurationen nur für alle gleich angewendet werden, z.b.

- WLAN Standard / Frequenz
- Funkkanal

Die Entscheidung ob Teilnehmer eines WLANs (virtueller Accesspoint) mit anderen im gleichen kommunizieren können, wird über ap_isolate=0 oder ap_isolate=1 konfiguriert. Wenn man z.b. Geräten die Kommunikation erlaubt, kann man *nicht* via iptables danach irgendwelche Einschränkungen einstellen. Aller eingehender Netzwerkverkehr wird dann durch den hostapd daemon direkt um "userland" weitergeleitet. Teilnehmer von 2 verschiedenen WLAN Netzwerken hingegen können mittels iptables moderiert werden.

### WiFi / WLAN Roaming

Das Thema klingt komple, ist jedoch relativ einfach. Man kann mehrere Acceess Points betrieben, mit der gleichen SSID / Netzwerknamen. Wenn alle die gleiche Authentifizierung erfordern, wird das WLAN Endgerät einfach den AccessPoint mit dem stärksten Signal wählen. Im Haushalt sind die WLAN Teilnehmer meist nicht super mobil und nutzen das Internet meist von einem festen Ort. Wenn man beispielsweise das Handy ausschaltet, trennt es die WLAN Verbindung und sobald man es entsperrt, wird nach dem stärksten Signal gesucht und verbunden. Allerdings muss man hier zur Vermeidung von asynchronem Routing entsprechende Subnetze verwenden - das Thema behandeln wir noch im Detail. 

## Die Umsetzung

### hostapd
Der hostapd ind Verbindung mit z.b. der RaLink RT5370 hat die Möglichkeit mehrere virtuell Accesspoints zu erzeugen. Hierzu ist es notwendig das jeder virtueller Accesspoint eine eigene MAC-Adresse bekommt. Hierzu nimmt man am besten die orginal MAC des WLAN Adapters, ändert die letzte Stelle auf "1" und zählt dann für jede weitere BSSID um eins hoch. Wichtig dabei ist, das es nicht nur logisch um eins erhöht wird, zb. "59 + 1 = 5A", sondern die letzte Zahl muss um einen Zähler erhöht werden.

```shell
ifconfig wlan1 |grep ether
ether 00:ba:35:e2:11:c8  txqueuelen 1000  (Ethernet)
```

Um das Problem zu lösen, wird die Haupt bssid auf "00:ba:35:e2:11:c1" gesetzt. Es reicht aus das in der Konfiguration zu mache, da der hostapd beim Start die MAC-Adresse entsprechend konfiguriert. Leider kann man hier den neuen virtuelle wlan_X Interfaces keine IP Adresse zuweisen. Auch die wpa_supplicant Konfiguration hat nicht funktioniert, so das ich mich für folgende Lösung entscheiden habe.

/lib/systemd/system/hostapd.service
```ini
...
ExecStartPost=/usr/local/bin/wlan.sh
...
```

/usr/local/bin/wlan.sh 
```shell
#!/bin/bash
ifconfig wlan1 192.168.42.1
ifconfig wlan1_0 192.168.43.1
ifconfig wlan1_1 192.168.44.1
ifconfig wlan1_2 192.168.45.1
systemctl restart isc-dhcp-server.service 
```

Der letzte Eintrag ist auch notwendig, das der dhcp server leider nur beim Start überprüft welche IPs verfügbar sind und die besagten Interfaces und IPs ja erst bei dem hostapd Service erzeugt werden.

/etc/hostapd/hostapd.conf
```ini
# AP details
interface=wlan1
bssid=00:ba:35:e2:11:c1
# auf 1, da sonst der country code nicht gesendet wird
ieee80211d=1
country_code=DE
# 11 Keller, 1 OG, 6 EG
channel=11
ctrl_interface=/var/run/hostapd
ctrl_interface_group=0
hw_mode=g
ieee80211n=1
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa_pairwise=CCMP
rsn_pairwise=CCMP
mobility_domain=e612
pmk_r1_push=1

ht_capab=[HT20][SHORT-GI-20][RX-STBC123]
wme_enabled=1

ieee80211ac=1

# Beacons
beacon_int=50
dtim_period=2
preamble=1

ssid=Trusted
ap_isolate=0
wpa=2
wpa_key_mgmt=WPA-PSK
wpa_psk_file=/etc/hostapd/keys/psk_trusted
wpa_pairwise=CCMP
rsn_pairwise=CCMP

bss=wlan1_0
bssid=00:ba:35:e2:11:c2
ssid=Guest
ap_isolate=1
wpa=2
wpa_key_mgmt=WPA-PSK
wpa_psk_file=/etc/hostapd/keys/psk_guest
wpa_pairwise=CCMP
rsn_pairwise=CCMP

bss=wlan1_1
bssid=00:ba:35:e2:11:c3
ssid=IoT
ap_isolate=1
wpa=2
wpa_key_mgmt=WPA-PSK
wpa_psk_file=/etc/hostapd/keys/psk_iot
wpa_pairwise=CCMP
rsn_pairwise=CCMP

bss=wlan1_2
bssid=00:ba:35:e2:11:c4
ssid=Bosch
ap_isolate=0
wpa=2
wpa_key_mgmt=WPA-PSK
wpa_psk_file=/etc/hostapd/keys/psk_bosch
wpa_pairwise=CCMP
rsn_pairwise=CCMP
```

In den verschiedenen /etc/hostapd/keys/psk Dateien kann entweder pro MAC ein spezifisches Passwort vergeben werden oder wie im Beispiel gezeigt am Ende auch ein wildcard Passwort. Wichtig ist es, den Wildcard Match als letzten Eintrag zu haben, da beim Verbindungsaufbau die erste Mac, die dem Muster entspricht verwendet wird.

```ini
08:a6:bc:75:77:18 fHo7tPai76AiaQGlnr4=
00:00:00:00:00:00 HrLfBQFoP38ttiDkmFc=
```

Dadurch ist es möglich, z.b. jedem IoT Gerät einen eigenen WLAN Schlüssel zu geben ohne beim Sperren gleich alle ändern zu müssen. Das Gleiche gilt für das Gäste WLAN, in dem man beispielsweise Rechner von der Arbeit haben will die einen eigenen Schlüssel bekommen und für normale Gäste ändert man den Schlüssel hin und wieder. Manche Hersteller versuchen dem Kunden zu helfen, indem sie das Passwort in der App speichern und wenn man ein weiteres Gerät hinzufügt, wird diese Passwort übertragen. 

So zum Beispiel Amazons Alexa, bei dem alle Alexa Geräte sich den selben WLAN Schlüssel teilen müssen. Klingt vielleicht komfortabel, aber wenn man sich klarmacht, das hierzu der Schlüssel in der App gespeichert und vermutlich sogar zu Amazon übertragen wird, wird schnell klar das man hier nicht mehr von Sicherheit reden kann. Andere Hersteller agieren ähnlich und auch wenn alle Hardware Hersteller die größt mögliche Sorgfalt walten lassen, ist es nicht unmöglich das die Passwörter + WLAN SSID + ggfls GPS Koordinaten oder Adressen geleakt werden. Warum viele Gerätehersteller die Adresse wissen wollen ist auch eine gute Frage.

In meinem Beispiel könnte ein Angreifer die MAC Adresse fälschen, das gestohlene Passwort verwenden und wäre dann in einem WLAN, welches keinen Zugriff auf interne Geräte oder andere WLAN Teilnehmer zulässt, sondern könnte "nur" ins Internet gehen. Dieser Angriffsvektor ist nicht schön, aber für mich OK und in einem anderen Projekt werde ich das Monitoring näher beleuchten.

Am besten rebooted man das System, um sicherzugstellen, das alle konfigurationen wie gewünscht persistiert sind. Danach sollte man die neuen WLAN Accesspoints bereits sehen und sich verbinden können. Allerdings wird man noch keine IP Adresse erhalten, da der DHCP nocht nicht konfiguriert ist.

### DHCP Server

Auf Grund der technischen Ausgereiftheit und des Funktionsumfangs, verwende ich lieber den ISC DHCP als den neuerdings recht häufig verwendeten dnsmasq, welche dns und dhcp in einem vereint.

```shell
systemctl stop dnsmasq.service 
systemctl disable dnsmasq.service 

apt-get install -y isc-dhcp-server
```

In der /etc/dhcp/dhcpd.conf wird nun für jeden virtuellen Accesspoint eine subnetz Deklaration erstellt.

```ini
...
# Admin WLAN
subnet 192.168.42.0 netmask 255.255.255.0 {
  range 192.168.42.10 192.168.42.250;
  option subnet-mask 255.255.255.0;
  option routers 192.168.42.1;
  ddns-domainname "home.sascha-curth.de";
  option domain-search "home.sascha-curth.de";
  option domain-name-servers 192.168.42.1;
  option ntp-servers 192.168.42.1;
}

...
# Gäste WLAN
subnet 192.168.43.0 netmask 255.255.255.0 {
  range 192.168.43.10 192.168.43.250;
  option subnet-mask 255.255.255.0;
  option routers 192.168.43.1;
  option domain-name-servers 8.8.8.8;
  ddns-updates off;
}
```
Für das Gäste Netzwerk habe ich die dyndns Einträge deaktiviert und da diese Teilnehmer nicht auf interne Resourcen zugreifen können (iptables), muss auch der DNS Server entsprechend im Internet sein.

### Der eigene DNS Server

Um nicht alle Clients mit externen DNS Servern reden zu lassen wird ein bind9 auf dem Haupt Raspi (homeberry) installiert.
```shell
apt-get install bind9
systemctl restart bind9.service 
```

Die Funktion des DNS Servers kann man z.b. wiefolgt testen
```shell
dig a www.google.de @127.0.0.1

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Raspbian <<>> a www.google.de @127.0.0.1
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 64223
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 4, ADDITIONAL: 9

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: 40bf2d5b01eccb58e004299e600de0f94bac0eacd11dd9e3 (good)
;; QUESTION SECTION:
;www.google.de.			IN	A

;; ANSWER SECTION:
www.google.de.		300	IN	A	172.217.16.67

;; AUTHORITY SECTION:
google.de.		86400	IN	NS	ns4.google.com.
google.de.		86400	IN	NS	ns2.google.com.
google.de.		86400	IN	NS	ns3.google.com.
google.de.		86400	IN	NS	ns1.google.com.

;; ADDITIONAL SECTION:
ns1.google.com.		81355	IN	A	216.239.32.10
ns2.google.com.		81355	IN	A	216.239.34.10
ns3.google.com.		81355	IN	A	216.239.36.10
ns4.google.com.		81355	IN	A	216.239.38.10
ns1.google.com.		81355	IN	AAAA	2001:4860:4802:32::a
ns2.google.com.		81355	IN	AAAA	2001:4860:4802:34::a
ns3.google.com.		81355	IN	AAAA	2001:4860:4802:36::a
ns4.google.com.		81355	IN	AAAA	2001:4860:4802:38::a

;; Query time: 59 msec
;; SERVER: 127.0.0.1#53(127.0.0.1)
;; WHEN: Sun Jan 24 22:04:57 CET 2021
;; MSG SIZE  rcvd: 344
```

Um den Zugriff auf diesen DNS Server aus allen lokalen Netzen zu erlauben, wird die /etc/bind/named.conf.options wiefolgt angepasst:
```
...
listen-on { 127.0.0.1; 192.168.42.1; };
allow-query { 127.0.0.1; 192.168.0.0/16; 172.16.0.0/16;  10.0.0.0/8;};
...
```

### Dynamischer DNS Update

Durch die Verwendung verschiedener Subnetze, kann man im DHCP leider keine feste IP Adresse pro Host vergeben. Daher habe ich mich entschieden einen automatischen DNS Eintrag erstellen zu lassen sobald sich ein Gerät erfolgreich verbunden und eine IP Adresse zugewiesen bekommen hat.

In der ISC-DHCP /etc/dhcp/dhcpd.conf
```config
...
ddns-updates on;
ddns-update-style interim;
update-static-leases on;
...
include "/etc/bind/keys.conf";
...
zone home.sascha-curth.de {
  primary 127.0.0.1;
  key home.sascha-curth.de.;
}
zone 168.192.in-addr.arpa {
  primary 127.0.0.1;
  key home.sascha-curth.de.;
}
```

Die /etc/bind/keys.conf enthält den notwendigen authorizations Schlüssel für bind9

```config
key home.sascha-curth.de. {
    algorithm HMAC-SHA512;
    secret "KrassGeheimerSchlüssel==";
};
```

Den Schlüssel kann man beispielsweise wiefolgt erstellen:

```shell
openssl rand -base64 40
kuvOs81k+Uy7rC6GdlMdLRHfmvRDFv503xblD/GWlDLhvxbo9h5gqw==
```

Die bind /etc/bind/named.conf wird erweitert:
```config
...
include "/etc/bind/keys.conf";
...
```

Jetzt wird noch die DNS Zonenkonfiguration /etc/bind/named.conf.home.sascha-curth.de angelegt:
```config
zone "home.sascha-curth.de" IN { 
    type master;
    file "/etc/bind/dyndns/db.home.sascha-curth.de";
    update-policy {
      grant home.sascha-curth.de. subdomain home.sascha-curth.de. ANY A TXT;
    };
};

zone "168.192.in-addr.arpa" {
    type master;
    file "/etc/bind/dyndns/db.192.168";
    update-policy {
      grant home.sascha-curth.de. subdomain 168.192.in-addr.arpa PTR;
    };
};
```

Das Verzeichnis "/etc/bind/dyndns" muss für den bind user schreibbar sein.

```shell
mkdir /etc/bind/dyndns
ps -ef|grep named
root      1007 23061  0 22:19 pts/1    00:00:00 grep named
bind     31859     1  0 22:12 ?        00:00:01 /usr/sbin/named -u bind

chmod g+w /etc/bind/dyndns
ls -ld /etc/bind/dyndns
drwxrwsr-x 2 root bind 4096 Jan 24 22:12 /etc/bind/dyndns
```

Nach einem Neustart vom bind9 und dhcp Dienst werden ab sofort automatisch DNS Einträge erstellt.

```shell
systemctl restart bind9.service 
systemctl restart isc-dhcp-server.service
```

```shell
grep map /var/log/syslog
...
Jan 24 17:36:56 homeberry dhcpd[8380]: Added new forward map from NPI90F9A6.home.sascha-curth.de to 192.168.40.11
Jan 24 17:36:56 homeberry dhcpd[8380]: Added reverse map from 11.40.168.192.in-addr.arpa. to NPI90F9A6.home.sascha-curth.de
...

host NPI90F9A6.home.sascha-curth.de
NPI90F9A6.home.sascha-curth.de has address 192.168.40.11

host 192.168.40.11
11.40.168.192.in-addr.arpa domain name pointer NPI90F9A6.home.sascha-curth.de.
```

### PXE / Netzwerk Boot der Raspberry Pi 3
...kommt demnächst

#  Das Ergebnis

## Wie gehts weiter
