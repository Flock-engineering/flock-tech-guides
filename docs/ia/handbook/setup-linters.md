---
sidebar_label: Setup de Linters
---

# Setup de Linters

## Subi la exigencia al maximo

Aca es donde la cosa se pone realmente interesante, y donde la mayoria de los equipos todavia no se dieron cuenta del cambio de paradigma.

En un equipo tradicional, las reglas de linting se mantienen "razonables". Y tiene sentido: si pones un threshold de coverage del 90%, cada vez que alguien toca un archivo tiene que escribir tests para llegar a ese numero. Eso lleva tiempo. Tiempo humano. Caro. Entonces los equipos negocian: "con 70% estamos bien", "esa regla de complejidad ciclomatica es muy agresiva, relajemosla", "el strict mode de TypeScript nos frena mucho". Decisiones pragmaticas basadas en una restriccion real: el tiempo humano es limitado.

Pero con IA, esa restriccion **desaparecio**.

El costo de que la IA arregle un warning de lint es practicamente cero. El costo de que escriba tests para subir el coverage es practicamente cero. El costo de que refactorice una funcion para bajar la complejidad ciclomatica es practicamente cero. Entonces, por que seguirias manteniendo las reglas "relajadas" de antes?

**Subir la exigencia al maximo no es un capricho, es la consecuencia logica del cambio de herramientas.** Cosas que antes eran "nice to have" ahora pueden ser obligatorias:

- **Linting estricto**: todas las reglas de ESLint o Biome activadas, sin excepciones
- **Coverage alto**: 80%, 90%, lo que tenga sentido para tu proyecto. La IA genera los tests
- **TypeScript en modo strict**: `strict: true`, `noUncheckedIndexedAccess`, `noImplicitReturns`. Todo prendido
- **Limites de complejidad**: funciones de mas de 20 lineas? Complejidad ciclomatica mayor a 10? Rechazado
- **Seguridad**: audit de dependencias, scanning de secrets, analisis estatico de vulnerabilidades
- **Documentacion**: JSDoc en funciones publicas, comentarios donde corresponda

:::warning
Subir la exigencia no significa poner reglas arbitrarias. Cada regla tiene que tener un PROPOSITO claro. No se trata de torturar a la IA (ni al dev que revisa el PR), se trata de que el codigo que llega a `main` sea de la mejor calidad posible. Si una regla no agrega valor, sacala. Pero si la sacaste porque "era dificil de cumplir"... con IA ya no tenes esa excusa.
:::
