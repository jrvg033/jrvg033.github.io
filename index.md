---
layout: default
title: "Inicio"
---

# Catálogo de Billetes Mexicanos

Bienvenido a la colección visual de billetes antiguos.

<ul>
  {% for post in site.posts %}
    <li><a href="{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>
