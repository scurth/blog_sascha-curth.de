---
title: Luftentfeuchter Optimierung
description: Datenbasierte Optimierung
introimage: "/images/projekte/luftfeuchter-optimierung.jpg"
author: Sascha Curth
type: projekte
lang: de-DE
published: 28.02.2020
modified: 28.02.2020
---
# Inhalt
<TOC />

## Problemstellung
Im Aquaponik Bereich ist das Thema HVAC (Heating, Ventilation and Air Conditioning (dt. „Heizung, Lüftung, Klimatechnik“)), eines der größten Energieverbraucher und somit Kostentreiber. Meine Indoor Anlage benötigt zwingend eine aktive Luftentfeuchtung, welche ich mittels <a id="Comfree" title="Dies ist keine Kaufempfehlung">Comfee MDDF-20DEN7-WF"</a> sicherstelle. Bisher habe ich das Gerät 24h am Tag laufen lassen und die "smarte" Laufzeiteinstellung gewählt. Dabei wird bis zur definierten Luftfeuchtigkeit getrocknet und dann wartet da Gerät ab bis sich der Wert um ca 5-10% erhöht, bevor die nächste Trocknung gestartet wird.

Da ich Nachts auch die Zirkulationslüftung im Raum ausschalte, hat mein Sensor schon immer Nachts ca 5 bis 10 Prozentpunkte mehr angezeigt als tagsüber, mit laufendem Lüfter. Dies wird im folgendem Bild gut sichtbar.
![Luftfeuchtigkeit-vorher](/images/projekte/luftfeuchtigkeit-vorher.png)
Auch wird die Innenraum Temperatur tagsüber durch die Lampen erhöht, was auch die Verdunstung mit beeinflusst.

## These
Da der Luftentfeuchter ein Timereinstellung hat, mit der man das Gerät zu einer fixen Uhrzeit aus und dann wieder einschalten kann, könnte ich es Nachts deaktiveren, dadurch steigt die Luftfeuchtigkeit und tagsüber wird wieder getrocknet. Für die Pflanzen wäre diese Schwankung dichter an der Natur und zusätzlich verbraucht das Gerät weniger Strom und wenn es an ist, besteht zumindest die Möglichkeit, das meine Solaranlage gleichzeitig Strom produziert. Fraglich ist, ob der Gesamtstromverbrauch sich dadurch reduziert oder ob es sich nur verschiebt bzw. komprimiert. Zusätzlich stellt sich die Frage, ob die Laufzeit ausreicht, um den Raum entsprechend trocken zu halten und die Wände nicht feucht werden.

## Experiment
Einstellungen getroffen:
- gleiche Ziel-Luftfeuchtigkeit
- aus um 20:30 Uhr
- an um 10 Uhr

Erste Beobachtungen zeigen einen Anstieg der Luftfeuchtigkeit auf bis zu 80% oder 10 Prozentpunkte höher steigt als vorher, gefolgt von einer schnellen Reduktion nach dem Einschalten. Zusätzlich ist die Raumtemperatur Nachts ca 1°C niedriger als vorher, was durch den deaktivierten Luftentfeuchter erklärbar ist. Auch die Tageshöchsttemperatur ist etwas geringer als üblich, könnte aber auch andere Ursachen haben.
![Luftfeuchtigkeit-nachher](/images/projekte/luftfeuchtigkeit-nachher.png)

Den Stromverbrauch wird mittels <a id="Blitzwolf" title="Dies ist keine Kaufempfehlung">Blitzwolf+BW-SHP6</a> erfasst, welche mit Tasmota Firmware ausgestattet ist und die Daten via MQTT an Mosquitto sendet und dann via Telegraf in die InfluxDB speichert. An dieser Steckdose sind zusätzlich Lampen und Aquarienluftpumpen angeschlossen und daher muss der Stromverbrauch relativ unterschieden werden. Die linke Seite des Graphen zeigt den vorherigen zustand, bei dem Nachts ca 200W kontinuierlich verbraucht worden sind. Das Tal in der Mitte ist der neue Zustand, mit nächtlicher Deaktivierung.

![Luftfeuchtigkeit-strom](/images/projekte/luftfeuchtigkeit-strom.png)

Im 7-Tages Rückblick erkennt man sehr gut die gesamte Reduktion, welche sich rein rechnerisch bei 0,2kwh * ca. 14h = 2.8kwh bewegen müsste. Abzüglich eines Mehrverbrauchs um die nächtliche Pause auszugleichen.
![Luftfeuchtigkeit-strom7tage](/images/projekte/luftfeuchtigkeit-strom7tage.png)

| Tag | Stromverbrauch dieses Stromkreises | Kommentar |
| --- | :---: | --- |
| 21.02.2020 | 6.7 kwh | Referenz |
| 22.02.2020 | 6.9 kwh | Referenz |
| 23.02.2020 | 7.1 kwh | Referenz |
| 24.02.2020 | 7.1 kwh | Referenz |
| 25.02.2020 | 7.2 kwh | Referenz |
| 26.02.2020 | 6.6 kwh | Luftentfeuchter-Abschaltung um 20:30 |
| 27.02.2020 | <b>4.7 kwh</b> | erster vollständiger Tag |
| 28.02.2020 | | zweiter vollständiger Tag |

## Ergebnis
Die langfristige Auswirkung der nächtlichen Luftfeuchtigkeit muss weiter beoabachtet werden, aber die Reduktion der Temperatur wird besonders in den Sommermonaten hilfreich sein und die Reduzierung des Stromverbrauchs von >2kwh pro Tag ergeben einen jährliche Ersparnis von 2kwh * 30 cent * 365 Tage = 216 €. Ab März wird hoffentlich wieder die Sonne scheinen und dementsprechend der Eigenverbrauch entsprechend steigen.

Hätte man das ganze auch ohne Sensoren, Grafana und Nerdigkeit erreichen können? Vermutlich ja - aber wo bleibt da der Spass und die Wissenschaft.
