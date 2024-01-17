<template>
    <div class="container">

        <form v-if="content" @submit.prevent="submitContentForm" class="series-form">
            <h2>Edit Content - {{ content.title }}</h2>
            <div v-for="(media, mIndex) in content.media" :key="mIndex">
                <h2>{{ media.category }} | {{ media.subCategory }} <i class="fas fa-trash"
                        @click.prevent="removeMedia(mIndex)"></i></h2>

                <label for="categoryTitle">Category:</label>
                <select id="categoryTitle" v-model="media.category" required>
                    <option v-for="(category, index) in config.categories" :key="index" :value="category">
                        {{ category }}
                    </option>
                </select>

                <label for="videoType">Sub Category:</label>
                <select id="videoType" v-model="media.subCategory" required>
                    <option v-for="(subcat, index) in config.subcats" :key="index" :value="subcat">
                        {{ subcat }}
                    </option>
                </select>

                <label for="videoType">Speaker:</label>
                <select id="categoryTitle" v-model="media.speaker" required>
                    <option v-for="(speaker, index) in config.speakers" :key="index" :value="speaker">
                        {{ speaker }}
                    </option>
                </select>

                <label for="videoUrl">Video URL:</label>
                <input id="videoUrl" v-model="media.videoUrl" type="text" />

                <label for="audioUrl">Audio URL:</label>
                <input id="audioUrl" v-model="media.audioUrl" type="text" />

                <label for="description">Description:</label>
                <textarea id="description" v-model="media.description"></textarea>
                <button @click.prevent="addScripture(media.id)">Add Scripture</button>

                <div class="scripture-form" v-for="(scripture, sIndex) in media.scriptures" :key="sIndex">
                    <h2>
                        Scripture Reference {{ sIndex + 1 }}:
                        <i class="fas fa-trash" @click.prevent="removeScripture(media.id, sIndex)"></i>
                    </h2>

                    <label for="reference">Reference: </label>
                    <input id="reference" v-model="scripture.reference" type="text" />

                    <label for="scriptureLink">Link:</label>
                    <input id="scriptureLink" v-model="scripture.link" type="text" />
                </div>
            </div>

            <button @click.prevent="addMedia">Add Media</button>
            <button @click.prevent="save">Save</button>

            <!-- <button type="submit">Save</button> -->
        </form>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '@/main.js';
import { doc, getDoc, query, collection, getDocs, setDoc } from 'firebase/firestore';
import { getPlatform } from '@/composables/helpers';

const route = useRoute();
const episodeId = ref(route.params.id);
const episodeFinal = ref({
    serviceTypes: [],
});

const showModal = ref(false);
const showDiscard = ref(false);
const content = ref({});


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

const removeMedia = (index) => {
    content.value.media.splice(index, 1);
    console.log(content.value);
};

const removeScripture = (id, scriptureIndex) => {
    //find the episode in episodeFinal by id
    const index = content.value.media.findIndex((media) => media.id === id);
    //remove scripture from episodeFinal
    content.value.media[index].scriptures.splice(scriptureIndex, 1);
};


const addScripture = (id) => {
    //find the episode in episodeFinal by id

    //find index of media by id
    const index = content.value.media.findIndex((media) => media.id === id);
    console.log(index);

    //add scripture to episodeFinal
    content.value.media[index].scriptures.push({
        reference: '',
        link: '',
    });
}

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

const generateUID = () => {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      for (let i = 0; i < 20; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }

const save = async () => {
    //recalculate platform
    for (let i = 0; i < content.value.media.length; i++) {
        content.value.media[i].videoPlatform = getPlatform(content.value.media[i].videoUrl);
    }
    const docRef = doc(db, 'episodes', content.value.id);
    await setDoc(docRef, content.value);
    console.log('Document written with ID: ', docRef.id);
};

onMounted(async () => {
    // Assuming you have a function called `fetchEpisode` to get the episode data
    content.value = await fetchEpisode(episodeId.value);
    config.value = await fetchConfig();

    console.log(content.value);
    console.log(config.value);
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