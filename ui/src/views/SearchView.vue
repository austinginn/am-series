<template>
    <div class="header">
        <h1>Alpharetta Methodist</h1>
        <div class="search-box">
            <input type="text" v-model="searchTerm" placeholder="Search..." />
            <span href="/search" class="search-icon">
                <i class="fas fa-search"></i>
            </span>
        </div>
    </div>
    <div class="search-view">
        <div class="filters">


            <div class="date-filters">
                <i class="fas fa-filter"></i>
                <span>Dates</span>
                <input id="start-date" v-model="startDate" type="date" placeholder="Start Date" />
                <span>to</span>
                <input id="end-date" v-model="endDate" type="date" placeholder="End Date" />
            </div>

            <select id="speaker" v-model="selectedSpeaker">
                <option value="">Select Speaker</option>
                <option v-for="(speaker, index) in config.speakers" :key="index" :value="speaker">{{ speaker }}</option>
            </select>

            <select id="service-type" v-model="selectedServiceType">
                <option value="">Select Service Type</option>
                <option v-for="(serviceType, index) in config.subcats" :key="index" :value="serviceType">{{ serviceType }}
                </option>
            </select>
            <button @click="resetFilters">Reset</button>
        </div>
        <div class="episodes">
            <EpisodeCardSmall v-for="(episode, index) in filteredEpisodes" :key="index" :episodeImage=episode.image
                :episodeTitle=episode.title :episodeDate=episode.date :episodeId="episode.id" :small="true" />
        </div>
    </div>
</template>
  
<script>
import { ref, computed, onMounted, watch } from 'vue';
import EpisodeCardSmall from '@/components/EpisodeCardSmall.vue';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { db } from '@/main.js';
import { useRoute } from 'vue-router';

export default {
    components: {
        EpisodeCardSmall,
    },
    setup() {
        const searchTerm = ref('');
        const selectedSpeaker = ref('');
        const selectedServiceType = ref('');
        const startDate = ref(null);
        const endDate = ref(null);
        const episodes = ref([]); // replace with your episodes data
        const route = useRoute();
        const config = ref({
            categories: [],
            speakers: [],
            liveUrl: '',
            subcats: [],
        });

        const filteredEpisodes = computed(() => {
            console.log('filteredEpisodes computed');
            // filter episodes based on search term and date range
            return episodes.value.filter(episode => {
                const matchesSearchTerm = !searchTerm.value || episode.title.includes(searchTerm.value) || episode.speaker.includes(searchTerm.value);
                const matchesStartDate = !startDate.value || new Date(episode.timestamp.toDate()) >= new Date(startDate.value);
                const matchesEndDate = !endDate.value || new Date(episode.timestamp.toDate()) <= new Date(endDate.value);
                const matchesSpeaker = !selectedSpeaker.value || episode.speaker === selectedSpeaker.value;
                const matchesServiceType = !selectedServiceType.value || episode.serviceType === selectedServiceType.value;
                return matchesSearchTerm && matchesStartDate && matchesEndDate && matchesSpeaker && matchesServiceType;
            });
        });

        const makeTitle = (title, serviceType, service) => {
            // make title for episode card
            let final = title + ' - ';
            if (serviceType !== 'Default') {
                final += `${serviceType}`;
            }
            if (service) {
                final += ` ${service}`;
            }

            return final;
        };

        const getAllEpisodes = async () => {
            // get all episodes from db
            // get all episodes from db
            const episodeCollection = collection(db, 'episodes');
            const episodeQuery = query(episodeCollection, orderBy('timestamp', 'desc'));
            const episodeSnapshot = await getDocs(episodeQuery);
            const episodeList = episodeSnapshot.docs.map(doc => doc.data());
            console.log(episodeList);

            //I think I need to break it all down here.
            for (let i = 0; i < episodeList.length; i++) {
                for (let x = 0; x < episodeList[i].serviceTypes.length; x++) {
                    for (let y = 0; y < episodeList[i][episodeList[i].serviceTypes[x]].length; y++) {
                        let episode = {}
                        episode.timestamp = episodeList[i].timestamp;
                        episode.date = episodeList[i].date;
                        episode.title = makeTitle(episodeList[i].title, episodeList[i].serviceTypes[x], episodeList[i][episodeList[i].serviceTypes[x]][y].type);
                        episode.serviceType = episodeList[i][episodeList[i].serviceTypes[x]][y].type;
                        episode.image = episodeList[i].image;
                        episode.speaker = episodeList[i][episodeList[i].serviceTypes[x]][y].speaker;
                        episodes.value.push(episode);
                    }
                }
            }

            console.log(episodes.value);
        };

        const getConfig = async () => {
            const configQuery = query(collection(db, 'config'));
            const configSnapshot = await getDocs(configQuery);

            if (!configSnapshot.empty) {
                const firstDoc = configSnapshot.docs[0];
                config.value = firstDoc.data();
                console.log(config.value); // Log the data of the first config document
            }
        }

        const resetFilters = () => {
            startDate.value = '';
            endDate.value = '';
            selectedSpeaker.value = '';
            selectedServiceType.value = '';
            searchTerm.value = '';
        };

        onMounted(async () => {
            await getAllEpisodes();
            await getConfig();
            searchTerm.value = route.query.q || '';
        });

        watch([selectedSpeaker, selectedServiceType], () => {
            filteredEpisodes.value;
        });

        return {
            searchTerm,
            startDate,
            endDate,
            filteredEpisodes,
            config,
            selectedServiceType,
            selectedSpeaker,
            resetFilters,
            makeTitle
        };
    },
};
</script>
  
<style scoped>
.search-view {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
}

.date-filters {
    display: flex;
    /* justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 20px; */
}

.date-filters label {
    margin-right: 10px;
    margin: 5px;
    /* font-weight: bold; */
}

.date-filter {
    width: 40%;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}

.episodes {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.episode-card {
    width: 100%;
    margin-bottom: 20px;
}


.header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    margin-top: 20px;
    padding-bottom: 0;
    padding-top: 0;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header h1 {
    margin: 0px;
}


.search-box input {
    width: 100%;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}

.search-box {
    position: relative;
    width: 250px;
}

.search-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    color: #333;
}

h2 {
    text-align: left;
}

.filters {
    display: flex;
    flex-wrap: wrap;
    /* justify-content: space-between; */
    align-items: center;
    gap: 10px;
    padding: 10px;
    padding-right: 0px;
    padding-left: 0px;
    background-color: #f5f5f5;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    width: 100%;
}

.filters i {
    color: #333;
    margin-right: 10px;
    margin-left: 10px;
}

.filters input,
.filters select {
    padding: 5px;
    border: none;
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.filters select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="black"><path d="M7 7l5 5 5-5z"/></svg>') no-repeat;
    background-position: right 10px top 50%;
    background-size: 12px;
}

#speaker {
    width: 150px;
}

#service-type {
    width: 150px;
}

button {
    display: inline-block;
    padding: 5px 10px;
    /* margin: 10px 2px; */
    /* font-size: 16px; */
    text-align: center;
    text-decoration: none;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    background-color: rgb(190, 32, 46);
}

button:hover {
    background-color: rgba(190, 32, 45, 0.526);
}

/* input {
    margin-right: 10px;
} */

@media (max-width: 600px) {
    .filters>* {
        flex-basis: 100%;
        /* margin-bottom: 10px; */
    }
    input {
        margin-left: 10px;
    }
    select {
        margin-left: 10px;
        margin-right: 10px;
    }
    button {
        margin-left: 10px;
        margin-right: 10px;
    }
}
i {
    margin: 5px;
}
span {
    margin: 5px;
}
</style>