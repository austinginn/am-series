<script setup>
import AddSeries from '@/components/AddSeries.vue'
import AddEpisode from '@/components/AddEpisode.vue'
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

//

const isMobile = computed(() => window.innerWidth <= 768);
const showSidebar = ref(!isMobile.value);

const toggleSidebar = () => {
    showSidebar.value = !showSidebar.value;
};
</script>



<template>
    <div id="dashboard">
        <header>
            <h1>Dashboard</h1>
        </header>

        <nav>
          <router-link to="/portal/series">Series</router-link>
            <router-link to="/portal/episodes">Content</router-link>
            <router-link to="/portal/add-series">Add Series</router-link>
            <router-link to="/portal/add-episode">Add Content</router-link>
            <router-link to="/portal/config">Config</router-link>
            <!-- Add more router-links for additional widgets/forms -->
        </nav>

        <main>
            <router-view></router-view>
        </main>
    </div>
</template>

<style>
#dashboard {
  display: grid;
  grid-template-columns: 200px auto;
  grid-template-rows: 70px auto;
  grid-template-areas: 
    "header header"
    "nav main";
  height: 100vh;
  font-family: 'Arial', sans-serif;
  color: #333;
  background-color: #f5f5f5;
}

header {
  grid-area: header;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em;
  background-color: #fff;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.2);
}

nav {
  grid-area: nav;
  padding: 1em;
  background-color: #fff;
  box-shadow: 2px 0 4px 0 rgba(0,0,0,0.2);
}

nav a {
  display: block;
  margin-bottom: 1em;
  color: #333;
  text-decoration: none;
}

main {
  grid-area: main;
  padding: 1em;
  background-color: #fff;
  overflow: auto;
  box-shadow: -2px 0 4px 0 rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
  #dashboard {
    grid-template-columns: 1fr;
    grid-template-rows: 70px 200px auto;
    grid-template-areas: 
      "header"
      "nav"
      "main";
  }
}
</style>