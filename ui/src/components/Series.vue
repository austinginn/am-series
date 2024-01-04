<template>
    <h2>Series</h2>
    <div>
        <SeriesCardSmall v-for="seri in series" :key="seri.id" :seriesImage=seri.image :seriesTitle=seri.title
            :seriesId="seri.id" :seriesStartDate="seri.startDate" :seriesEndDate="seri.endDate"
            :seriesDescription="seri.description" :small="true" />
    </div>
</template>
  
<script>
import { ref, computed, onMounted } from 'vue';
import { collection, query, orderBy, limit as fbLimit, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { db } from '@/main.js';
import SeriesCardSmall from '@/components/SeriesCardSmall.vue';

export default {
    components: {
        SeriesCardSmall
    },
    setup() {
        const series = ref([]);
        const limit = ref(10);


        const fetchSeries = async () => {
            // Fetch the episodes from the API and assign them to episodes.value
            const seriesQuery = query(
                collection(db, 'series'),
                orderBy('timestamp', 'desc'),
                fbLimit(10)
            );
            const querySnapshot = await getDocs(seriesQuery);
            series.value = querySnapshot.docs.map(doc => doc.data());
        };


        onMounted(fetchSeries);

        return {
            series,
            fetchSeries,
        };
    }
}
</script>