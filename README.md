# 🤖 Generador de Cuestionarios con IA para Wooclap

Aplicación web desarrollada con **Next.js y TypeScript** que utiliza Inteligencia Artificial para generar cuestionarios tipo test a partir de documentos.

El usuario puede cargar material docente, generar preguntas mediante **Google Gemini**, revisar y editar el contenido generado y exportarlo posteriormente a un archivo Excel para su utilización en **Wooclap**.

## 🌐 Aplicación

La aplicación está disponible en:

**https://quiz-0c1a.onrender.com/**

## 🚀 Puesta en marcha

### Requisitos

* Node.js
* npm
* Una clave de API de Google Gemini

### Instalación

Clona el repositorio:

```bash
git clone https://github.com/cce-ops/quiz-wooclap.git
cd quiz-wooclap
```

Instala las dependencias:

```bash
npm install
```

### Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto y añade la clave de API de Gemini:

```env
GEMINI_API_KEY=tu_clave_de_gemini
```

### Servidor de desarrollo

Ejecuta:

```bash
npm run dev
```

También pueden utilizarse otros gestores de paquetes compatibles con el proyecto:

```bash
yarn dev
```

```bash
pnpm dev
```

```bash
bun dev
```

Una vez iniciado el servidor, abre:

**http://localhost:3000**

Los cambios realizados en el código se reflejarán automáticamente durante el desarrollo.

## 🛠️ Tecnologías

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **Google Gemini**
* **Node.js**
* **Excel / XLSX**
* **Wooclap**

## 📚 Recursos

Si quieres consultar la documentación del framework utilizado:

* [Documentación de Next.js](https://nextjs.org/docs)
* [Aprender Next.js](https://nextjs.org/learn)
* [Repositorio de Next.js](https://github.com/vercel/next.js)

Para ejecutar la aplicación en producción:

```bash
npm run build
npm run start
```

