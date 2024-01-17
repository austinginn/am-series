<template>
    <div class="container">
        <form v-if="!showContentForm" @submit.prevent="submitForm" class="series-form">
            <h1>New Content</h1>

            <label for="episodeTitle">Content Title:</label>
            <input id="episodeTitle" v-model="content.title" type="text" required />

            <label for="episodeDate">Content Date:</label>
            <input id="episodeDate" v-model="content.timestamp" type="date" required />

            <label for="seriesId">Series:</label>
            <select id="seriesId" v-model="content.seriesId" required>
                <option v-for="series in seriesList" :key="series.id" :value="series.id">
                    {{ series.title }}
                </option>
            </select>

            <button @click.prevent="showContentForm = true; console.log(content)">Next</button>
        </form>
        <form v-if="showContentForm" @submit.prevent="submitContentForm" class="series-form">
            <!-- <div v-if="content.media > 0">
                <div v-for="(serviceType, index) in cont" :key="index">
                    <h3>{{ serviceType }}</h3>
                    <div v-for="(media, index) in episodeFinal[serviceType]" :key="index">
                        <a :href="media.videoUrl" target="_blank">{{ media.type }}</a>
                        <br>
                        <a v-if='media.audioUrl' :href="media.audioUrl" target="_blank">{{ media.type }} - audio</a>
                        <br v-if='media.audioUrl'>
                    </div>
                </div>
            </div> -->
            <div v-for="(media, mIndex) in content.media" :key="mIndex">
                <h2>{{ content.title }} - {{ media.category }} | {{ media.subCategory }} <i class="fas fa-trash"
                        @click.prevent="removeMedia(mIndex)"></i></h2>

                <label for="categoryTitle">Category:</label>
                <select id="categoryTitle" v-model="content.media[mIndex].category" required>
                    <option v-for="(category, catIndex) in config.categories" :key="catIndex" :value="category">
                        {{ category }}
                    </option>
                </select>

                <label for="videoType">Sub Category:</label>
                <select id="videoType" v-model="content.media[mIndex].subCategory" required>
                    <option v-for="(subcat, subCatIndex) in config.subcats" :key="subCatIndex" :value="subcat">
                        {{ subcat }}
                    </option>
                </select>

                <label for="videoType">Speaker:</label>
                <select id="categoryTitle" v-model="content.media[mIndex].speaker" required>
                    <option v-for="(speaker, speakerIndex) in config.speakers" :key="speakerIndex" :value="speaker">
                        {{ speaker }}
                    </option>
                </select>

                <label for="videoUrl">Video URL:</label>
                <input id="videoUrl" v-model="content.media[mIndex].videoUrl" type="text" />

                <label for="audioUrl">Audio URL:</label>
                <input id="audioUrl" v-model="content.media[mIndex].audioUrl" type="text" />

                <label for="description">Description:</label>
                <textarea id="description" v-model="content.media[mIndex].description"></textarea>
                <button @click.prevent="addScripture(mIndex)">Add Scripture</button>

                <div class="scripture-form" v-for="(scripture, scriptureIndex) in content.media[mIndex].scriptures"
                    :key="scriptureIndex">
                    <h2>
                        Scripture Reference {{ scriptureIndex + 1 }}:
                        <i class="fas fa-trash" @click.prevent="removeScripture(mIndex, scriptureIndex)"></i>
                    </h2>

                    <label for="reference">Reference:</label>
                    <input id="reference" v-model="scripture.reference" type="text" />

                    <label for="scriptureLink">Link:</label>
                    <input id="scriptureLink" v-model="scripture.link" type="text" />
                </div>
            </div>
            <div class="button-container">
                <button @click.prevent="addMedia">Add Media</button>
                <button @click.prevent="save(false)">Save</button>
            </div>
            <!-- <button v-if="showDiscard" @click.prevent="save(true)">Discard Current Media and Save</button>
            <button @click.prevent="showModal = true">Save</button>
            <div class="modal-backdrop" v-if="showModal"></div>

            <div class="modal" v-if="showModal">
                <h2>Would you like to add more media for {{ episodeFinal.title }} ?</h2>
                <div class="button-container">
                    <button @click.prevent="addMedia">Add Media</button>
                    <button @click.prevent="save(false)">Save</button>
                </div>
            </div> -->
        </form>
    </div>
</template>
  


<script setup>
import { ref, onMounted } from 'vue';
import { doc, setDoc, collection, serverTimestamp, Timestamp, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/main.js';
import { ulid } from 'ulid';
import { useRouter } from 'vue-router';
import EpisodePreview from '@/components/EpisodePreview.vue';
import { generateUID, convertDate, formatDate, convertTimestamp, getPlatform } from '@/composables/helpers.js';

const router = useRouter();
const showModal = ref(false);
const showDiscard = ref(false);
const showContentForm = ref(false);

const seriesList = ref([]);
const config = ref({});

const content = ref({
    title: '',
    timestamp: '',
    seriesId: '',
    image: '',
    id: generateUID(),
    date: '',
    media: [{
        category: 'Default',
        subCategory: 'Default',
        speaker: '',
        description: '',
        id: generateUID(),
        audioUrl: '',
        videoUrl: '',
        videoPlatform: '',
        scriptures: []
    }]
});

const fetchSeries = async () => {
    const seriesQuery = query(collection(db, 'series'), orderBy('timestamp', 'desc'));
    const seriesSnapshot = await getDocs(seriesQuery);
    seriesList.value = seriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Auto-select the most recent series
    if (seriesList.value.length > 0) {
        content.value.seriesId = seriesList.value[0].id;
    }
};

const fetchConfig = async () => {
    const configQuery = query(collection(db, 'config'));
    const configSnapshot = await getDocs(configQuery);

    if (!configSnapshot.empty) {
        const firstDoc = configSnapshot.docs[0];
        config.value = firstDoc.data();
        console.log(config.value); // Log the data of the first config document
    }
};

const addScripture = (index) => {
    content.value.media[index].scriptures.push({
        reference: '',
        link: ''
    });
};

const removeScripture = (mediaIndex, scriptureIndex) => {
    content.value.media[mediaIndex].scriptures.splice(scriptureIndex, 1);
};

const removeMedia = (mediaIndex) => {
    content.value.media.splice(mediaIndex, 1);
};

const addMedia = () => {
    content.value.media.push({
        category: 'Default',
        subCategory: 'Default',
        speaker: '',
        description: '',
        id: generateUID(),
        audioUrl: '',
        videoUrl: '',
        videoPlatform: '',
        scriptures: []
    });
};

const save = async () => {
    //set image by finding series from series list by id
    const series = seriesList.value.find(series => series.id === content.value.seriesId);
    content.value.image = series.image;

    //set the human redable date and timestamp
    const dateObj = convertDate(content.value.timestamp);
    content.value.date = formatDate(dateObj);
    content.value.timestamp = convertTimestamp(dateObj);

    //verify platform and set video platform
    for(let x = 0; x < content.value.media.length; x++) {
        content.value.media[x].videoPlatform = getPlatform(content.value.media[x].videoUrl);
    }

    console.log(content.value);

    //save to firestore
    await setDoc(doc(db, 'episodes', content.value.id), content.value);
}



onMounted(async () => {
    await fetchSeries();
    await fetchConfig();
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
    margin-top: 5px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
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