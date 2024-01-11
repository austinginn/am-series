<template>
    <div class="container">

        <form v-if="episodeFinal" @submit.prevent="submitContentForm" class="series-form">
            <h2>Edit Content</h2>
            <div v-if="episodeFinal.serviceTypes.length > 0">
                <div v-for="(serviceType, index) in episodeFinal.serviceTypes" :key="index">
                    <h3>{{ serviceType }}</h3>
                    <div v-for="(media, index) in episodeFinal[serviceType]" :key="index">
                        <a :href="media.videoUrl" target="_blank">{{ media.type }}</a> <i class="fas fa-trash"
                            @click.prevent="removeMedia(media.id)"></i>
                        <br>
                    </div>
                </div>
            </div>

            <div v-for="(episode, index) in episodes" :key="index">
                <h2>Add Media</h2>

                <label for="categoryTitle">Category:</label>
                <select id="categoryTitle" v-model="episode.serviceType" required>
                    <option v-for="(category, index) in config.categories" :key="index" :value="category">
                        {{ category }}
                    </option>
                </select>

                <label for="videoType">Sub Category:</label>
                <select id="videoType" v-model="episode.type" required>
                    <option v-for="(subcat, index) in config.subcats" :key="index" :value="subcat">
                        {{ subcat }}
                    </option>
                </select>

                <label for="videoType">Speaker:</label>
                <select id="categoryTitle" v-model="episode.speaker" required>
                    <option v-for="(speaker, index) in config.speakers" :key="index" :value="speaker">
                        {{ speaker }}
                    </option>
                </select>

                <label for="videoUrl">Video URL:</label>
                <input id="videoUrl" v-model="episode.videoUrl" type="text" />

                <label for="audioUrl">Audio URL:</label>
                <input id="audioUrl" v-model="episode.audioUrl" type="text" />

                <label for="description">Description:</label>
                <textarea id="description" v-model="episode.description"></textarea>
                <button @click.prevent="addScripture(episode.id)">Add Scripture</button>

                <div class="scripture-form" v-for="(scripture, sIndex) in episode.scripture" :key="sIndex">
                    <h2>
                        Scripture Reference {{ sIndex + 1 }}:
                        <i class="fas fa-trash" @click.prevent="removeScripture(episode.id, sIndex)"></i>
                    </h2>

                    <label for="reference">Reference: </label>
                    <input id="reference" v-model="scripture.reference" type="text" />

                    <label for="scriptureLink">Link:</label>
                    <input id="scriptureLink" v-model="scripture.link" type="text" />
                </div>
            </div>

            <!-- <button @click.prevent="addMedia">Add Media</button> -->
            <button v-if="showDiscard" @click.prevent="save(true)">Discard Current Media and Save</button>
            <button @click.prevent="addMedia">Add Media</button>
            <button @click.prevent="showModal = true">Save</button>
            <div class="modal-backdrop" v-if="showModal"></div>

            <div class="modal" v-if="showModal">
                <h2>Would you like to add more media for {{ episodeFinal.title }} ?</h2>
                <div class="button-container">
                    <button @click.prevent="addMedia">Add Media</button>
                    <button @click.prevent="save(false)">Save</button>
                </div>
            </div>
            <!-- <button type="submit">Save</button> -->
        </form>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '@/main.js';
import { doc, getDoc, query, collection, getDocs } from 'firebase/firestore';

const route = useRoute();
const episodeId = ref(route.params.id);
const episodeFinal = ref({
    serviceTypes: [],
});

const showModal = ref(false);
const showDiscard = ref(false);

const episode = ref({
    title: '',
    date: '',
    seriesId: '',
});

const content = ref({
    categoryTitle: '',
    videoType: '',
    videoUrl: '',
    audioUrl: '',
    description: '',
    speaker: '',
    scriptures: [],
});

const config = ref({});

const fetchEpisode = async (id) => {
    const docRef = doc(db, 'episodes', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        console.log('No such document!');
    }
};

const fetchConfig = async () => {
    const configQuery = query(collection(db, 'config'));
    const configSnapshot = await getDocs(configQuery);

    if (!configSnapshot.empty) {
        const firstDoc = configSnapshot.docs[0];
        return firstDoc.data();
    }
};

const removeMedia = (id) => {
    //find the episode in episodeFinal by id
    const { serviceType, index } = findEpisodeById(id);

    console.log(serviceType, index);

    episodeFinal.value[serviceType].splice(index, 1);
    console.log(episodeFinal.value);
};

const removeScripture = (id, scriptureIndex) => {
    //find the episode in episodeFinal by id
    const { serviceType, index } = findEpisodeById(id);

    console.log("Removing scripture from: ", serviceType, index);

    //remove scripture from episodeFinal
    episodeFinal.value[serviceType][index].scripture.splice(scriptureIndex, 1);

};

const findEpisodeById = (id) => {
    //find the episode in episodeFinal by id
    let index = -1;
    let serviceType = '';
    for(let x = 0; x < episodeFinal.value.serviceTypes.length; x++){
        index = episodeFinal.value[episodeFinal.value.serviceTypes[x]].findIndex((episode) => episode.id === id);
        if(index > -1){
            serviceType = episodeFinal.value.serviceTypes[x];
            break;
        }
    }

    console.log(serviceType, index);
    return { serviceType, index };
};

const addScripture = (id) => {
    //find the episode in episodeFinal by id
    const { serviceType, index } = findEpisodeById(id);

    console.log(serviceType, index);

    //add scripture to episodeFinal
    episodeFinal.value[serviceType][index].scripture.push({
        reference: '',
        link: '',
    });
}

const addMedia = () => {
    //add blank media to episode final
    episodeFinal.value[episodeFinal.value.serviceTypes[0]].push({ 
        audioUrl: '',
        type: '',
        speaker: '',
        videoPlatform: '',
        videoUrl: '',
        scripture: [],
        id: generateUID()
    })
};

const generateUID = () => {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      for (let i = 0; i < 20; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }

const episodes = computed(() => {
    let episodesArray = [];
    //convert episodeFinal into array of episodes
    for (let x = 0; x < episodeFinal.value.serviceTypes.length; x++) {
        for (let y = 0; y < episodeFinal.value[episodeFinal.value.serviceTypes[x]].length; y++) {
            const episode = {
                ...episodeFinal.value[episodeFinal.value.serviceTypes[x]][y],
                serviceType: episodeFinal.value.serviceTypes[x]
            };
            episodesArray.push(episode);
        }
    }
    return episodesArray;
});

onMounted(async () => {
    // Assuming you have a function called `fetchEpisode` to get the episode data
    episodeFinal.value = await fetchEpisode(episodeId.value);
    config.value = await fetchConfig();

    // //convert episodeFinal into array of episodes
    // for (let x = 0; x < episodeFinal.value.serviceTypes.length; x++) {
    //     for (let y = 0; y < episodeFinal.value[episodeFinal.value.serviceTypes[x]].length; y++) {
    //         const episode = {
    //             ...episodeFinal.value[episodeFinal.value.serviceTypes[x]][y],
    //             serviceType: episodeFinal.value.serviceTypes[x]
    //         };
    //         episodes.value.push(episode);

    //     }
    // }
    // console.log(episodes.value);
    console.log(episodeFinal.value);
});

</script>

<style scoped>
h3 {
    margin-bottom: 0;
}

.fas.fa-trash {
    cursor: pointer;
    font-size: 0.8em;
    /* Adjust the size as needed */
}

.container {
    /* display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh; */
}

.series-form {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}

.series-form label {
    font-weight: bold;
    margin-top: 20px;
}

.series-form input,
.series-form textarea {
    margin: 10px 0;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 100%;
}

.series-form select {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.series-form button {
    margin-top: 20px;
    padding: 10px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.scripture-form {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.series-form button:hover {
    background-color: #0056b3;
}

.modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    background-color: white;
    padding: 20px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    width: 80%;
    /* Adjust as needed */
    max-width: 500px;
    /* Adjust as needed */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    /* Add a shadow for a 3D effect */
}

.modal h2 {
    text-align: center;
}

.modal button {
    margin: 10px;
    text-align: center;
}

.button-container {
    display: flex;
    justify-content: center;
}

.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    /* Semi-transparent black */
    z-index: 999;
    /* Lower than the modal but higher than the rest of the content */
}
</style>