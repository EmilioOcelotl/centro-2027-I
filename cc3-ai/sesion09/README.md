# Sesión 09 · Un número que cambia

**Código Creativo 3 · Arquitectura de Interiores · 2027-I**

Un archivo para pegar en [hydra.ojack.xyz](https://hydra.ojack.xyz/):
**[`ondas.js`](ondas.js)**. Se copia completo (el botón de copiar arriba a la
derecha del archivo en GitHub) y se pega en lugar del código que trae el
editor.

## La idea

En Hydra casi cualquier número se puede cambiar por una función:

```js
shape(4, 0.3, 0.01).out()                                  // fijo
shape(4, () => 0.3 + 0.15 * Math.sin(time), 0.01).out()   // cambia con el tiempo
```

Hydra llama a la función en cada cuadro. El archivo recorre cuatro formas de
darle ese número: el seno, otras señales (sierra, escalón, azar), una lista y
el micrófono. Al final, un estado como señal: respira, late, tiembla.

## Cómo correrlo

| qué | teclas |
|---|---|
| un bloque | el cursor adentro y `Alt+Enter` |
| una línea | `Ctrl+Enter` |
| todo | `Ctrl+Shift+Enter` |
| esconder el código | `Ctrl+Shift+H` |

Al abrir el archivo conviene correr todo una vez: los bloques 3 a 6 usan las
señales que define el bloque 3.

## El seno

```
centro + amplitud · sen(2π · (frecuencia · tiempo + fase))
```

| perilla | qué es |
|---|---|
| `centro` | alrededor de qué valor se mueve |
| `amplitud` | cuánto se aleja del centro |
| `frecuencia` | cuántas vueltas da en un segundo |
| `fase` | en qué punto de la vuelta empieza; `0.5` es al revés |

## Referencia

- [Funciones de Hydra](https://hydra.ojack.xyz/api/)
- [Audio en Hydra: a.fft, setBins, setSmooth, setScale](https://hydra.ojack.xyz/docs/docs/learning/guides/audio/)
