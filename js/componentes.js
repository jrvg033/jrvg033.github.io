// Inyectar Google AdSense u otro script en el <head>
const adsenseScript = document.createElement("script");
adsenseScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
adsenseScript.async = true;
adsenseScript.setAttribute("data-ad-client", "ca-pub-XXXXXXXXXXXXXXX"); // Reemplaza con tu ID
document.head.appendChild(adsenseScript);

// Ejemplo: insertar bloque AdSense en una sección del body (si lo deseas)
const adDiv = document.getElementById("bloque-adsense");
if (adDiv) {
  adDiv.innerHTML = `
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-XXXXXXXXXXXXXXX"
         data-ad-slot="1234567890"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
  `;
}

// Puedes usarlo también para insertar Analytics, barras laterales, etc.
