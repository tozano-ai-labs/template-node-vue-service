<script setup>
import { onMounted, ref } from "vue";
import { fetchHealth } from "./api.js";

const status = ref("chargement");
const error = ref("");

onMounted(async () => {
  try {
    const health = await fetchHealth();
    status.value = health.status;
  } catch (cause) {
    error.value = cause.message;
  }
});
</script>

<template>
  <main class="app">
    <h1>Template Node + Vue</h1>
    <p v-if="error" class="error">Erreur : {{ error }}</p>
    <p v-else>État du service : {{ status }}</p>
  </main>
</template>

<style scoped>
.app {
  max-width: 48rem;
  margin: 4rem auto;
  padding: 0 1.5rem;
  font-family:
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    sans-serif;
}

h1 {
  font-size: 1.75rem;
}

.error {
  color: #b42318;
}
</style>
