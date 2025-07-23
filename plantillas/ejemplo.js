// Inserta AdSense en el <head>
const adsenseScript = document.createElement("script");
adsenseScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
adsenseScript.async = true;
adsenseScript.setAttribute("data-ad-client", "ca-pub-XXXXXXXXXXXXXXX"); // reemplaza con tu ID
document.head.appendChild(adsenseScript);

// Código que se ejecuta solo en entradas
document.addEventListener("DOMContentLoaded", function () {
  if (document.body.id === "entrada") {
    const scriptEntrada = document.createElement("script");
    scriptEntrada.src = "/js/solo-entrada.js";
    document.body.appendChild(scriptEntrada);
  }
});
