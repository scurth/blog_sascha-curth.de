---
title: Das (fast) perfekte Heimnetzwerk für das Jahr 2021
description: In diesem Artikel zeige ich wie man mit openSource Komponenten ein sicheres, performantes und erweiterbares Netzwerk aufbaut.
introimage: "/images/projekte/security-2688911_640.jpg"
type: projekte
lang: de-DE
published: 20.01.2021
---
# {{ $frontmatter.title }}
![L1]( /images/projekte/security-2688911_640.jpg )

<TOC />


## Problemstellung

Ein verlässliches, sicheres und performantes Heimnetzwerk ist die Grundlage nicht nur aller IoT Geräte, sondern auch des normalen Lebens heutzutage. Insbesondere Home Office und Home Schooling bringen hohe Anforderungen. Während es im kommerziellen Bereich recht gute Geräte gibt, mit denen man diese Anforderungen abdecken kann, sind die Geräte für Endwanwender oft nur bedingt geeignet.

Während der letzten Monate arbeiten meine Frau und ich von zuhause, mit entsprechend vielen Videokonferenzen und zusätzlich benötigen unsere Kinder zur gleichen Zeit Internetzugang. Ein Ausfall des Internetzugangs ist entsprechend nervig. Weder MacOS, Linux, noch Windows sind per se sicher oder unsicher. Es ist mir wichtig, sicherzustellen, dass die fremd-adminstrierten Arbeitsrechner weder auf irgendwelche internen Geräte zugreifen können, noch irgendein internes Gerät einen Arbeitsrechner erreichen kann. Ich denke niemand will auf Arbeit erklären müssen, dass z.b.ein Virus / Trojaner aus dem eigenen Netzwerk den Arbeitsrechner befallen hat und anschliessend irgendwelche Firmendaten verschlüsselt oder vernichtet wurden.

Da meine Internetanbindung ein Privat und kein Geschäftskunden Tarif ist, ist die Verfügbarkeitsgarantie von Vodafone entsprechend. Im Falle eines Ausfalls, möchte ich den Internetzugang über ein LTE Modem transparent zur Verfügung stellen. Hier ist das Volumen pro Monat allerdings begrenzt und dementsprechend soll diese Verbindung nur im Ernstfall genutzt werden und bestimmte Geräte, wie z.b. der Fernseher, nicht darüber ins Internet gehen.

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

- gleiche Zugangsdaten für alle HomeConnect Geräte
- Zugriff auf das Internet
- Zugriff auf IPs im gleichen Subnetz
- kein Zugriff auf andere interne Resourcen

### Ethernet / LAN
Diverse Geräte sind über Netzwerkkabel an meine Switche angebunden und ich habe mich entscheiden erstmal die Switche zu behalten, werde aber vermulich in Zukunft in einen neuen investieren.

- Zugriff auf interne Resourcen und Internet via iptables moderieren

## Hardware

### Haupt-Raspberry (homeberry)

- Raspberry Pi 4 / 8GB RAM
- 120 GB SSD + USB 3.0 Adapter
- Ralink Technology, Corp. RT5370 Wireless Adapter
- DELOCK 62966 Netzwerkadapter, USB 3.0, Gigabit Ethernet, 4 x RJ45
- ICY BOX IB-HUB1703-QC3 7-fach USB 3.0 Industrie Hub mit Netzteil
- Netgear LB2120-100PES 4G LTE Modem

### 2 x WLAN Erweiterung (apberry01 & apberry02)

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

Neben der generellen Unterstützung durch Linux / Hostapd ist es wichtig, dass der Chipsatz folgende Dinge unterstützt:

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

Generell arbeiten die meisten IoT Geräte im 2.4GHz Bereich und unterstützen üblicherweise b/g/n, sehr selten wird auch das 5GHz Netz unterstützt.

Weitere Details zu den Standards findet man auf [wikipedia](https://de.wikipedia.org/wiki/IEEE_802.11)

### hostapd Einschränkungen / Limitierungen

Wenn man mit dem hostapd mehrere virtuelle Accesspoints betreibt, können bestimmte Konfigurationen nur für alle gleich angewendet werden, z.b.

- WLAN Standard / Frequenz
- Funkkanal

Die Entscheidung ob Teilnehmer eines WLANs (virtueller Accesspoint) mit anderen im gleichen kommunizieren können, wird über ap_isolate=0 oder ap_isolate=1 konfiguriert. Wenn man z.b. Geräten die Kommunikation erlaubt, kann man **nicht** via iptables danach irgendwelche Einschränkungen einstellen. Aller eingehender Netzwerkverkehr wird dann durch den hostapd daemon direkt um "userland" weitergeleitet. Teilnehmer von 2 verschiedenen WLAN Netzwerken hingegen können mittels iptables moderiert werden.

### WiFi / WLAN Roaming

Das Thema klingt komplex, ist jedoch relativ einfach. Man kann generell mehrere Access Points betrieben, mit der gleichen SSID / Netzwerknamen. Wenn alle die gleiche Authentifizierung erfordern, wird das WLAN Endgerät einfach den AccessPoint mit dem stärksten Signal wählen. Im Haushalt sind die WLAN Teilnehmer meist nicht super mobil und nutzen das Internet meist von einem festen Ort. Wenn man beispielsweise das Handy ausschaltet, trennt es die WLAN Verbindung und sobald man es entsperrt, wird nach dem stärksten Signal gesucht und verbunden. Allerdings muss man hier zur Vermeidung von asynchronem Routing entsprechende Subnetze verwenden - das Thema behandeln wir noch im Detail. 

## Die Umsetzung

### hostapd
Der hostapd in Verbindung mit z.b. der RaLink RT5370 hat die Möglichkeit mehrere virtuell Accesspoints zu erzeugen. Hierzu ist es notwendig das jeder virtueller Accesspoint eine eigene MAC-Adresse bekommt. Hierzu nimmt man am besten die orginal MAC des WLAN Adapters, ändert die letzte Stelle auf "1" und zählt dann für jedes weitere WLAN Netz (BSSID) um eins hoch. Wichtig dabei ist, das es nicht nur logisch um eins erhöht wird, zb. HEX "59 + 1 = 5A", sondern die letzte Zahl muss um einen Zahl erhöht werden.

```shell
ifconfig wlan1 |grep ether
ether 00:ba:35:e2:11:c8  txqueuelen 1000  (Ethernet)
```

Hier wird die Haupt BSSID auf "00:ba:35:e2:11:c1" gesetzt. Der hostapd wird dann beim Start die MAC-Adresse der WLAN Schnittstelle entsprechend konfiguriert. Leider kann man hier den neuen virtuelle wlan_X Interfaces nicht direkt eine IP Adresse zuweisen. Auch die wpa_supplicant Konfiguration funktioniert nicht, so dass ich mich für folgende Lösung entscheiden habe.

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

Der letzte Eintrag ist auch notwendig, da der dhcp server leider nur beim Start überprüft welche IPs verfügbar sind und die besagten Interfaces und IPs ja erst bei dem hostapd Service erzeugt werden.

/etc/hostapd/hostapd.conf
```ini
# AP details
interface=wlan1
bssid=00:ba:35:e2:11:c1
# auf 1, da sonst der country code nicht gesendet wird
ieee80211d=1
country_code=DE
# Funkkanäle 1 Keller, 6 EG, 11 OG
channel=1
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

In den verschiedenen /etc/hostapd/keys/psk_X Dateien kann entweder pro MAC ein spezifisches Passwort vergeben werden oder wie im Beispiel gezeigt am Ende auch ein wildcard Passwort. Wichtig ist es, den Wildcard Match als letzten Eintrag zu haben, da beim Verbindungsaufbau die erste MAC, die dem Muster entspricht verwendet wird.

```ini
08:a6:bc:75:77:18 fHo7tPai76AiaQGlnr4=
00:00:00:00:00:00 HrLfBQFoP38ttiDkmFc=
```

Dadurch ist es möglich, z.b. jedem IoT Gerät einen eigenen WLAN Schlüssel zu geben ohne beim Sperren gleich alle ändern zu müssen. Insbesondere wenn man mehr als 10 WLAN Steckdosen hat, kann das eine tagesfüllende Aufgabe sein. Das Gleiche gilt für das Gäste WLAN, in dem man beispielsweise die Rechner von der Arbeit haben will. Diese bekommen einen eigenen, individuellen Schlüssel und für normale Gäste ändert man den Schlüssel regelmäßig. 

Manche Hersteller versuchen dem Kunden zu helfen, indem sie das Passwort in der App speichern und wenn man ein weiteres Gerät hinzufügt, wird dieses Passwort übertragen. So zum Beispiel Amazons Alexa, bei dem alle Alexa Geräte sich den selben WLAN Schlüssel teilen müssen. Klingt vielleicht komfortabel, aber wenn man sich klarmacht, das hierzu der Schlüssel in der App gespeichert und vermutlich sogar zu Amazon übertragen wird, wird schnell klar das man hier nicht mehr von Sicherheit reden kann. Andere Hersteller agieren ähnlich und auch wenn alle Hardware Hersteller die größt mögliche Sorgfalt walten lassen, ist es nicht unmöglich, dass die Passwörter + WLAN SSID + ggfls GPS Koordinaten oder Adressen geleakt werden. Warum viele Gerätehersteller GPS oder die Adresse wissen wollen ist auch eine gute Frage.

In meinem Beispiel könnte ein Angreifer die MAC Adresse fälschen, das gestohlene Passwort verwenden und wäre dann in einem WLAN, welches jedoch keinen Zugriff auf interne Geräte oder andere WLAN Teilnehmer zulässt, sondern könnte "nur" ins Internet gehen. Dieser Angriffsvektor ist nicht schön, aber für mich OK und in einem anderen Projekt werde ich das Monitoring näher beleuchten.

Am besten rebooted man an der Stelle das System, um sicherzugstellen, das alle Konfigurationen wie gewünscht persistiert sind. Danach sollte man die neuen WLAN Accesspoints bereits sehen und sich verbinden können. Allerdings wird man noch keine IP Adresse erhalten, da der DHCP nocht nicht konfiguriert ist.

### DHCP Server

Auf Grund der technischen Ausgereiftheit und des Funktionsumfangs, verwende ich gerne den ISC DHCP und nicht dnsmasq, welche dns und dhcp in einem vereint.

```shell
systemctl stop dnsmasq.service 
systemctl disable dnsmasq.service 

apt-get install -y isc-dhcp-server
```

In der /etc/dhcp/dhcpd.conf wird nun für jeden virtuellen Accesspoint eine Subnetz Deklaration erstellt.

```properties
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

Die Funktion des DNS Servers kann man wiefolgt testen

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
```properties
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

```properties
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
```properties
...
include "/etc/bind/keys.conf";
...
```

Jetzt wird noch die DNS Zonenkonfiguration /etc/bind/named.conf.home.sascha-curth.de angelegt:
```properties
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

Zur perfekten WLAN Versorgung des gesamten Hauses, habe ich mich entschieden auf jede Etage einen Raspberry 3 zu stationieren. Dieser wird mit dem gleichen USB WLAN Adapter ausgetattet und ist über Ethernet/eth0 am gleichen Switch wie der Haupt Raspi. Diese Erweiterungs Raspis bekommen keine SD-Karte oder sonstiges lokales Boot Medium, sondern werden über PXE / NFS betrieben.

---
**NOTIZ**

PXE geht **nicht** über WLAN/WiFI, sondern ausschliesslich über Ethernet. 

---

Der Boot Prozess sie wiefolgt aus:

- Rasperry Stromversorgung aktivieren
- Raspberry wartet auf Ethernet Link
- sendet DHCP request und erwartet in der Antwort u.a. die TFTP Server Option
- Verbindung zum TFTP Server aufbauen und bootcode.bin herunterladen
- danach restliche /boot Dateien via TFTP herunterladen, incl cmdline.txt
- in der cmdline.txt wird das nfsroot beschrieben, das dann vom Raspberry eingebunden wird
- fertig gebootet.

#### PXE/USB Boot Modus aktivieren
Die Raspberry 3 konnten ursprünglich nur von SD-Karte booten. Wenn man jedoch die aktuelle Firmware einmal installiert hat, kann man wie folgt prüfen ob es bereits richtig eingestellt ist. Sollte USB boot schon gehen, kann man sich den Test sparen.

```shell
vcgencmd otp_dump | grep 17
17:3020000a
```

Sollte hier ein anderer Wert stehen, einfach die /boot/config.txt um folgende Zeile erweitern und rebooten:

```ini
program_usb_boot_mode=1
```

Diese Einstellung ist nur einmal pro Gerät notwendig und dauerhaft.

#### DHCP und TFTP
Bei mir sind die Raspberry über den switch an eth2 mit dem Hauptrasberry (homeberry) verbunden, welches sich im 10.0.1.0/24 Subnetz befindet.

/etc/dhcp/dhcpd.conf erweitern
```properties
subnet 10.0.1.0 netmask 255.255.255.0 {
  range 10.0.1.10 10.0.1.250;
  option subnet-mask 255.255.255.0;
  option routers 10.0.1.1;
  ddns-domainname "home.sascha-curth.de";
  option domain-search "home.sascha-curth.de";
  option domain-name-servers 192.168.42.1;
  option ntp-servers 10.0.1.1;
  default-lease-time 7200;
  max-lease-time 7200;
}

host apberry01 { fixed-address 10.0.1.101; hardware ethernet b8:27:eb:7a:cd:98; next-server 10.0.1.1; option tftp-server-name "10.0.1.1"; }
host apberry02 { fixed-address 10.0.1.102; hardware ethernet b8:27:eb:3f:01:c2; next-server 10.0.1.1; option tftp-server-name "10.0.1.1"; }
```

Als nächstes erfolgt die Installation und Konfiguration des TFTP Servers.

```shell
apt-get install -y tftpd-hpa
```

/etc/default/tftpd-hpa 
```properties
# /etc/default/tftpd-hpa

TFTP_USERNAME="tftp"
TFTP_DIRECTORY="/srv/tftp"
# eth2 gbit switch
TFTP_ADDRESS="10.0.1.1:69"
TFTP_OPTIONS="--secure --ipv4 -vvv"
```

```shell
mkdir -p /srv/tftp
systemctl enable tftpd-hpa.service
systemctl start tftpd-hpa.service

ps -ef|grep tftp
/usr/sbin/in.tftpd --listen --user tftp --address 10.0.1.1:69 --secure --ipv4 -vvv /srv/tftp
```

Haupt Raspi, der als tfpt next-server definiert ist:
```shell
tail -f /var/log/syslog | grep tftpd

Jan 18 19:28:30 homeberry in.tftpd[1043]: RRQ from 10.0.1.101 filename bootcode.bin
Jan 18 19:28:30 homeberry in.tftpd[1044]: RRQ from 10.0.1.101 filename bootsig.bin
Jan 18 19:28:30 homeberry in.tftpd[1044]: sending NAK (1, File not found) to 10.0.1.101
Jan 18 19:28:30 homeberry in.tftpd[1046]: RRQ from 10.0.1.101 filename 2a7acd98/start.elf
```

Nach dem die "bootcode.bin" herunter geladen wurde, wird versucht die restlichen boot Dateien zu laden. Hierbei generiert jeder PXE boot client einen unique identifier, in diesem Beispiel **2a7acd98**. Diesen String müssen wir uns merken und brauchen den im nächsten Schritt, in dem wir einen entsprechenden Ornder anglegen.

#### TFTP boot Verzeichnis bereitstellen

Auf [raspberry.org](https://www.raspberrypi.org/software/operating-systems/) findet man den Downlowd Link zum aktuelle RaspiOS/Raspbian. Für meinen Anwendungszweck empfiehlt sich das Lite image, da die Desktop Komponenten unnötiger Ballast wären.

```shell
cd /srv
wget https://downloads.raspberrypi.org/raspios_lite_armhf/images/raspios_lite_armhf-2021-01-12/2021-01-11-raspios-buster-armhf-lite.zip
unzip 2021-01-11-raspios-buster-armhf-lite.zip

fdisk -lu 2021-01-11-raspios-buster-armhf-lite.img
Disk 2021-01-11-raspios-buster-armhf-lite.img: 1.8 GiB, 1862270976 bytes, 3637248 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xe8af6eb2

Device                                    Boot  Start     End Sectors  Size Id Type
2021-01-11-raspios-buster-armhf-lite.img1        8192  532479  524288  256M  c W95 FAT32 (LBA)
2021-01-11-raspios-buster-armhf-lite.img2      532480 3637247 3104768  1.5G 83 Linux
```

Für den nächsten Schritt benötigen wir nur die boot Partition, welche bei 8192 beginnt und hat eine Gesamtgröße von 256M. Da das Image eine Sector Größe von 512 bytes hat, müssen wir das kurz umrechen.

```shell
echo "512 * 8192"|bc -l
4194304

mkdir /srv/image_boot
mount -o loop,offset=4194304,sizelimit=256M 2021-01-11-raspios-buster-armhf-lite.img /srv/image_boot
```

Der Inhalt wird nun in den TFTP Ordner synchronisiert und die cmdline.txt entsprechend angepasst. Der Ordner Name ist dynamisch pro PXE Client, und kann über das Logfile wie im vorherigen Schritt beschrieben herausgefunden werden.

```shell
mkdir -p /srv/tftp/2a7acd98
rsync -avz /srv/image_boot/ /srv/tftp/2a7acd98

cat /srv/tftp/2a7acd98/cmdline.txt 
root=/dev/nfs nfsroot=192.168.41.1:/srv/nfs/apberry01,vers=4.1,proto=tcp rw ip=dhcp rootwait elevator=deadline
```

#### NFS root Verzeichnis bereitstellen

Jeder PXE Client bindet sein Datei System via NFS ein, welches schreibbar sein muss.

```shell
apt-get install -y nfs-kernel-server

cat /etc/exports 
/srv/nfs/apberry01 10.0.1.101/32(rw,sync,no_root_squash,no_subtree_check)
/srv/nfs/apberry02 10.0.1.102/32(rw,sync,no_root_squash,no_subtree_check)
/etc/hostapd/keys 10.0.1.101/32(ro,sync,no_root_squash,no_subtree_check) 10.0.1.102/32(ro,sync,no_root_squash,no_subtree_check)
```

Als nächstes wird das RaspiOS Lite Image in den entprechenden Ordner kopiert.

```shell
mkdir /srv/image_root
mount -o loop,offset=272629760 2021-01-11-raspios-buster-armhf-lite.img /srv/image_root

mkdir -p /srv/nfs/apberry01
mkdir -p /srv/nfs/apberry02
rsync -azv /srv/image_root/ /srv/nfs/apberry01
rsync -azv /srv/image_root/ /srv/nfs/apberry02

mkdir -p /srv/nfs/apberry01/boot
mkdir -p /srv/nfs/apberry02/boot
```

Jetzt könnte man den Raspberry bereits starten, aber es gibt noch einige Dinge die man gleich konfigurieren kann. Am einfachsten geht es mit folgendem script.

apberry01.sh
```shell
#!/bin/bash

CHROOTDIR=/srv/nfs/apberry01

# SSH Daemon automitsch beim ersten boot starten
touch ${CHROOTDIR}/boot/ssh

# Hostnamen setzen
sed -i -e 's/raspberrypi/apberry01/g' ${CHROOTDIR}/etc/hosts
sed -i -e 's/raspberrypi/apberry01/g' ${CHROOTDIR}/etc/hostname

# Default Root Partitionsdefinition entfernen
cat <<EOF > ${CHROOTDIR}/etc/fstab
proc            /proc           proc    defaults          0       0
EOF

# Notwendige Paket installieren
chroot ${CHROOTDIR} /bin/bash -x <<'EOF'
systemctl disable resize2fs_once.service
apt-get update && apt-get upgrade -y
dpkg-reconfigure debconf -f noninteractive -p critical
DEBIAN_FRONTEND=noninteractive apt-get install -yq isc-dhcp-relay hostapd dnsutils tcpdump

EOF

cat <<FILEEND > ${CHROOTDIR}/etc/default/isc-dhcp-relay
# Defaults for isc-dhcp-relay initscript
# sourced by /etc/init.d/isc-dhcp-relay
# installed at /etc/default/isc-dhcp-relay by the maintainer scripts

#
# This is a POSIX shell fragment
#

# What servers should the DHCP relay forward requests to?
SERVERS="10.0.1.1"

# On what interfaces should the DHCP relay (dhrelay) serve DHCP requests?
INTERFACES="eth0 wlan1 wlan1_0 wlan1_1 wlan1_2"

# Additional options that are passed to the DHCP relay daemon?
OPTIONS="-4"
FILEEND


cp /etc/hostapd/hostapd.conf_apberry01 ${CHROOTDIR}/etc/hostapd/hostapd.conf
mkdir -p ${CHROOTDIR}/etc/hostapd/keys

grep '^nohook wpa_supplicant$' ${CHROOTDIR}/etc/dhcpcd.conf || echo 'nohook wpa_supplicant' >>  ${CHROOTDIR}/etc/dhcpcd.conf

cat <<EOF > ${CHROOTDIR}/usr/local/bin/wlan.sh
#!/bin/bash
killall wpa_supplicant
killall dhcrelay
ifconfig wlan1 192.168.142.1
ifconfig wlan1_0 192.168.143.1
ifconfig wlan1_1 192.168.144.1
ifconfig wlan1_2 192.168.145.1
start-stop-daemon --start --quiet --pidfile /var/run/dhcrelay.pid --exec /usr/sbin/dhcrelay -- -a -4 -iu eth0 -i wlan1 -i wlan1_0 -i wlan1_1 -i wlan1_2 10.0.1.1
EOF
chmod +x ${CHROOTDIR}/usr/local/bin/wlan.sh

cat <<EOF > ${CHROOTDIR}/etc/systemd/system/multi-user.target.wants/hostapd.service
[Unit]
Description=Advanced IEEE 802.11 AP and IEEE 802.1X/WPA/WPA2/EAP Authenticator
After=network.target
Before=isc-dhcp-server.service

[Service]
Type=forking
PIDFile=/run/hostapd.pid
Restart=on-failure
RestartSec=2
Environment=DAEMON_CONF=/etc/hostapd/hostapd.conf
EnvironmentFile=-/etc/default/hostapd
ExecStart=/usr/sbin/hostapd -B -P /run/hostapd.pid -B $DAEMON_OPTS ${DAEMON_CONF}
ExecStartPost=/usr/local/bin/wlan.sh

[Install]
WantedBy=multi-user.target
EOF

## disable ipv6
cat <<EOF >>${CHROOTDIR}/etc/sysctl.conf
net.ipv6.conf.all.disable_ipv6=1
net.ipv6.conf.default.disable_ipv6=1
net.ipv6.conf.lo.disable_ipv6=1
net.ipv6.conf.eth0.disable_ipv6 = 1
net.ipv4.ip_forward = 1
EOF
```

Und fertig...jetzt sollte der neue Raspberry via PXE booten ...

## Netzwerk Layout und Routing

Jeder Access Point benötigt ein eigenes Netz pro WLAN, auch wenn es unter der gleichen SSID, mit den gleichen PSK angeboten wird.

Beispiel:
Admin WLAN
- homeberry 192.168.42.0/24
- apberry01 192.168.142.0/24
- apberry02 192.168.242.0/24

Wenn man sich auf dem apberry01 anmeldet, leitet der lokale dhcp-relay die Anfrage an den homeberry weiter. Wenn der jetzt dem Client die 192.168.41.x zuweisen würde, würde die Antwort nicht über das Ethernet an den apberry01 weitergeleitet werden, sondern er würde versuchen es über das WLAN Netzwerk (192.168.42.0) zu senden. Da der apberry01 in dem Fall, jedoch nur einen Accesspoint anbietet und nicht selber Teil des WLAN Netzwerkes ist, würde die Antwort dort nie ankommen...Stichwort asynchrones routing. Das ist im Normalfall jedoch kein Problem, da man selten weiss welche IP Adresse man hat, der dynamische DNS Eintrag aktuell gehalten wird und man so zusätzlich recht einfach ermitteln kann, mit welchem Accesspoint man gerade verbunden ist. Die einzige negative Einschränkung die sich hieraus ergibt, ist die Tatsache, dass man keine statischen IPs vergeben kann, ausser man stellt sicher, dass man sich immer über den gleichen Accesspoint verbindet.

#  Das Ergebnis

Mein Haus hat endlich auf jeder Etage einen Top Empfang, der Durchsatz ist deutlich besser, da die WLAN Accesspoints via Ethernet angeschlossen sind und für die verschiedenen WLAN Client Bedürfnisse kann ich die notwendige Seperation durchführen. Die gesamte Umstellung hat locker 2 Wochen gedauert und die größten Schwierigkeiten ergaben sich in der hostapd Konfiguration, da hier die Dokumentation deutliches Verbesserungspotential hat. Den einen apberry konnte ich sogar in der Unterverteilung einbauen, so dass der nicht irgendwo rumsteht.

![apberry_offen](/images/projekte/IMG_4255.JPG)
![apberry_zu](/images/projekte/IMG_4256.JPG)
## Wie gehts weiter

Da dieses Projekt ziemlich groß und lang geworden ist, habe ich mich entschieden für folgende Themen einen extra Artikel anzulegen:

- dual internet uplink / failover
- iptables Absicherung
- QR Code generieren für das Gäste WLAN
- automatischer reload der hostapd daemons wenn sich ein PSK geändert hat
- WLAN Feldstärke Messung via WLAN Steckdosen
- ...

Wie immer, eine Sache ordentlich erledigt und schon hat man hundert neue Ideen was man auf der neuen Grundlage noch alles machen kann.
