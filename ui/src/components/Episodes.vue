<template>
    <h2>Episodes</h2>
    <div>
        <input v-model="searchTerm" @input="search" placeholder="Search episodes..." />

        <EpisodeCardSmall v-for="episode in episodes" :key="episode.id"
            :episodeTitle=episode.title :episodeDate=episode.date :episodeId="episode.id" :episodeImage="episode.image" :small="true" />

        <button v-if="showMoreButton" @click="showMore">Show more</button>
    </div>
</template>
  
<script>
import { ref, computed, onMounted } from 'vue';
import { collection, query, orderBy, limit as fbLimit, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { db } from '@/main.js';
import EpisodeCardSmall from '@/components/EpisodeCardSmall.vue';

export default {
    components: {
        EpisodeCardSmall
    },
    setup() {
        const episodes = ref([]);
        const searchTerm = ref('');
        const limit = ref(10);


        const fetchEpisodes = async () => {
            // Fetch the episodes from the API and assign them to episodes.value
            const episodesQuery = query(
                collection(db, 'episodes'),
                orderBy('timestamp', 'desc'),
                fbLimit(10)
            );
            const querySnapshot = await getDocs(episodesQuery);
            episodes.value = querySnapshot.docs.map(doc => doc.data());
        };

        const search = async () => {
            // Search the episodes based on searchTerm.value and assign the results to episodes.value
        };

        const showMore = () => {
            limit.value += 10;
        };

        onMounted(fetchEpisodes);

        return {
            episodes,
            searchTerm,
            fetchEpisodes,
            search,
            showMore
        };
    }
}
</script>