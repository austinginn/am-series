<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
<RouterView />
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
  max-width: 1000px;
  margin: 0 auto; /* Add this line */
  display: block; /* Add this line */
}
</style>