# Imágenes: origen y estado

La pieza debe hablar de todo el territorio, no solo de Mina Lucía. Donde no hay fotografía definitiva se usa una provisional, marcada aquí, que Turismo de Álava sustituirá.

## Definitivas (Dropbox, serie Quintas · Mina Lucía y Antoñana)

| Fichero | Uso |
|---|---|
| `hero-bajo-tierra.jpg` | Hero, «Bajo tierra» |
| `galeria-entibada.jpg` | La cita bajo tierra |
| `veta-asfalto.jpg` | El concepto (decorado) |
| `casco-veta.jpg` | Tres puertas · Mina Lucía |
| `grupo-galeria.jpg` | Experiencias · Mina Lucía |
| `camino-casco.jpg` | Experiencias · La ruta |
| `mina-lucia-galeria.jpg` | Qué verás (a sangre, oscurecida) |
| `tren-antonana.jpg` | Tres puertas · La ruta |
| `galeria-01.jpg` … `galeria-12.jpg` | La galería (carrusel): 0M3A1867, 0M3A1922, FJ_6861, FJ_6550, FJ_6652, FJ_6429, FJ_6757, FJ_6246, FJ_6833, FJ_6944, FJ_6907, FJ_6920 |
| `asfalto-mano.jpg` | Asfalto (primera fotografía): FJ_6944 |
| `veta-asfalto.jpg` | Asfalto (a sangre) y los cantos de roca (ui/Canto.astro) |

## Provisionales · Wikimedia Commons (CC BY-SA 4.0)

Sustituir por fotografía propia. Mientras estén publicadas requieren atribución.

| Fichero | Uso | Original |
|---|---|---|
| `hero-cielo-abierto.jpg` | Hero, «A cielo abierto» · Cielo (a sangre, bajo las nubes) | Izki - Peña del Castillo 01 |
| `izki-pena-castillo.jpg` | Montaña Alavesa | Izki - Peña del Castillo 02 |
| `izki-mirador.jpg` | Tres miradores (a sangre) | Izki - Mirador de Izki 01 |
| `izki-hojas.jpg` | Decorado (Fase 03) | Izki - Otoño 01 |
| `izki-centro-korres.jpg` | Reserva | Centro de Interpretación del Parque Natural de Izki |
| `izki-barranco.jpg` | Reserva | Izki - Barranco de Izki 01 |

## Provisionales · asfaltokia.eus (propiedad del cliente, 480 px)

Baja resolución: valen para tarjetas pequeñas, no a sangre. Pedir originales.

| Fichero | Uso |
|---|---|
| `web-atauri-galeria-1.jpg` | Estación (foto histórica) · Tres puertas · Experiencias |
| `web-historia-img-1.jpg` | Reserva (antes en Cifras, sustituida por Estratos) |
| `web-geologia-img-1.jpg` | Reserva (antes en El concepto; ahora son cantos de la veta) |
| resto `web-*.jpg` | Reserva |

## Logotipo de minube

| Fichero | Uso |
|---|---|
| `brand/minube-logo.png` (194×47) | Header y pie, sobre superficies claras |
| `brand/minube-logo-bone.png` | Lo mismo sobre ink y plum: el texto pasa a bone y la nube se queda verde. Se genera con `node tools/make-minube-bone.mjs` |

Tal como lo facilitó minube, recortado a su caja. A 194 px de ancho cubre el
tamaño al que se usa (80 px de diseño); conviene pedir el vector para
pantallas grandes con densidad doble.

## Generadas (sin origen fotográfico)

| Fichero | Uso | Cómo |
|---|---|---|
| `decor/nubes-1.png`, `nubes-2.png` | Cielo: tiras de nubes con alfa que cruzan la imagen | `node tools/make-clouds.mjs` (ruido fractal periódico) |
| `decor/canto-1..3.png` | Máscaras de los cantos de roca (Concepto, Asfalto) | `node tools/make-cantos.mjs` |

## Vídeo

| Origen | Uso |
|---|---|
| Vimeo 1012453058 · «Parque Natural de Izki», Arabako Foru Aldundia | Cielo: se carga al pulsar (ui/Vimeo.astro), con `dnt=1` |

## Marca

`asfaltokia-simbolo.png` (512 px) y `asfaltokia-logo-blanco.png` (300 px) tal como los facilitó el cliente. Conviene pedir el logotipo en vector.

## Pendiente de fotografía

- La estación de Atauri rehabilitada, exterior e interior.
- Paisaje abierto del valle y los tres miradores.
- Antoñana, Korres e Izki: los otros dos centros.
- Fábrica de Leorza, San Ildefonso, minas de San Román.
