<template>
    <div class="container">
        <form v-if="!showContentForm" @submit.prevent="submitForm" class="series-form">
            <h1>New Content</h1>

            <label for="episodeTitle">Content Title:</label>
            <input id="episodeTitle" v-model="episodeFinal.title" type="text" required />

            <label for="episodeDate">Content Date:</label>
            <input id="episodeDate" v-model="episodeFinal.timestamp" type="date" required />

            <label for="seriesId">Series:</label>
            <select id="seriesId" v-model="episodeFinal.seriesId" required>
                <option v-for="series in seriesList" :key="series.id" :value="series.id">
                    {{ series.title }}
                </option>
            </select>

            <button @click.prevent="showContentForm = true">Next</button>
        </form>
        <form v-if="showContentForm" @submit.prevent="submitContentForm" class="series-form">
            <h2>Add Media</h2>

            <label for="categoryTitle">Category:</label>
            <select id="categoryTitle" v-model="content.categoryTitle" required>
                <option v-for="(category, index) in config.categories" :key="index" :value="category">
                    {{ category }}
                </option>
            </select>

            <label for="videoType">Sub Category:</label>
            <select id="videoType" v-model="content.videoType" required>
                <option v-for="(subcat, index) in config.subcats" :key="index" :value="subcat">
                    {{ subcat }}
                </option>
            </select>

            <label for="videoType">Speaker:</label>
            <select id="categoryTitle" v-model="content.speaker" required>
                <option v-for="(speaker, index) in config.speakers" :key="index" :value="speaker">
                    {{ speaker }}
                </option>
            </select>

            <label for="videoUrl">Video URL:</label>
            <input id="videoUrl" v-model="content.videoUrl" type="text" />

            <label for="audioUrl">Audio URL:</label>
            <input id="audioUrl" v-model="content.audioUrl" type="text" />

            <label for="description">Description:</label>
            <textarea id="description" v-model="content.description"></textarea>
            <button @click.prevent="addScripture">Add Scripture</button>

            <div class="scripture-form" v-for="(scripture, index) in content.scriptures" :key="index">
                <h2>
                    Scripture Reference{{ index + 1 }}:
                    <i class="fas fa-trash" @click.prevent="removeScripture(index)"></i>
                </h2>

                <label for="reference">Reference:</label>
                <input id="reference" v-model="scripture.reference" type="text" />

                <label for="scriptureLink">Link:</label>
                <input id="scriptureLink" v-model="scripture.link" type="text" />
            </div>

            <!-- <button @click.prevent="addMedia">Add Media</button> -->
            <button v-if="showDiscard" @click.prevent="save(true)">Discard Current Media and Save</button>
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
  
<script>
import { ref, onMounted } from 'vue';
import { doc, setDoc, collection, serverTimestamp, Timestamp, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/main.js';
import { ulid } from 'ulid';
import { useRouter } from 'vue-router';

export default {
    setup() {
        const router = useRouter();
        const showModal = ref(false);
        const showDiscard = ref(false);
        //final episode object:
        const episodeExample = ref({
            id: "",
            seriesId: "",
            serviceTypes: [
                "Contemporary",
                "Traditional"
            ],
            timestamp: "ts",
            title: "episode title",
            Contemporary: [
                {
                    audioUrl: "",
                    videoUrl: "",
                    videoPlatform: "",
                    speaker: "",
                    type: "Full Service",
                    description: "yo",
                    scriptures: [
                        {
                            link: "",
                            reference: ""
                        }
                    ],

                }
            ]
        });
        //////

        const episodeFinal = ref({
            serviceTypes: [],
        });

        const contentArray = [];

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

        const addScripture = () => {
            content.value.scriptures.push({ reference: '', link: '' });
        };

        const removeScripture = (index) => {
            content.value.scriptures.splice(index, 1);
        };

        const seriesList = ref([]);
        const showContentForm = ref(false);
        const config = ref({});

        const submitForm = async () => {
            const uid = generateUID();
            const episodeRef = doc(db, 'episodes', uid);

            await setDoc(episodeRef, {
                title: episode.value.title,
                date: episode.value.date,
                seriesId: episode.value.seriesId,
                id: uid,
                timestamp: serverTimestamp(),
            });
        };

        const save = async (skip = false) => {
            console.log("in save");
            if(!skip){
                console.log("in save adding media");
                addMedia();
            }
            //create uid for episode
            episodeFinal.value.id = ulid();

            //find series from series list using seriesId
            for (let i = 0; i < seriesList.value.length; i++) {
                if (seriesList.value[i].id == episodeFinal.value.seriesId) {
                    episodeFinal.value.image = seriesList.value[i].image;
                }
            }

            // Convert string to JavaScript Date
            if (typeof episodeFinal.value.timestamp === 'string') {
                episodeFinal.value.timestamp = new Date(episodeFinal.value.timestamp);
            }

            episodeFinal.value.date = new Date(episodeFinal.value.timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            // Convert JavaScript Date to Firebase Timestamp
            episodeFinal.value.timestamp = Timestamp.fromDate(episodeFinal.value.timestamp);


            // Add the episode to the database
            const episodeRef = doc(db, 'episodes', episodeFinal.value.id);
            await setDoc(episodeRef, episodeFinal.value);
            router.push('/portal/episodes')
        }

        const addMedia = async () => {
            console.log("in add media");
            //add serviceType if needed
            if (episodeFinal.value.serviceTypes.length == 0) {
                episodeFinal.value.serviceTypes.push(content.value.categoryTitle);
            } else {
                let flag = false;
                for (let i = 0; i < episodeFinal.value.serviceTypes.length; i++) {
                    if (episodeFinal.value.serviceTypes[i] == content.value.categoryTitle) {
                        flag = true;
                    }
                }
                if (!flag) {
                    episodeFinal.value.serviceTypes.push(content.value.categoryTitle);
                }
            }



            // Check if the array exists and is not empty
            if (!Array.isArray(episodeFinal.value[content.value.categoryTitle]) || !episodeFinal.value[content.value.categoryTitle].length) {
                // Initialize the array if it does not exist or is empty
                episodeFinal.value[content.value.categoryTitle] = [];
            }

            episodeFinal.value[content.value.categoryTitle].push(
                {
                    videoUrl: content.value.videoUrl,
                    videoPlatform: getPlatform(content.value.videoUrl), //getPlatform is a function that returns the platform (youtube, vimeo, etc.)
                    audioUrl: content.value.audioUrl,
                    description: content.value.description,
                    speaker: content.value.speaker,
                    type: content.value.videoType,
                    scripture: content.value.scriptures,
                });

            //logging
            console.log(episodeFinal.value);

            //clear form

            content.value = {
                categoryTitle: '',
                videoType: '',
                videoUrl: '',
                description: '',
                speaker: '',
                scriptures: [],
            };

            //scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showDiscard.value = true;
            showModal.value = false;

        }

        const getPlatform = (url) => {
            // Prepend 'https://' if it's missing
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }

            //get platform from url
            const hostname = new URL(url).hostname;
            if (hostname.includes('youtube.com')) {
                return 'youtube';
            } else if (hostname.includes('vimeo.com')) {
                return 'vimeo';
            } else {
                return 'unknown';
            }
        }

        const submitContentForm = () => {
            // Submit the content form
            // You can add your logic here to save the content to the database
            console.log(episodeFinal.value);
            showContentForm.value = false;
        };

        const fetchSeries = async () => {
            const seriesQuery = query(collection(db, 'series'), orderBy('timestamp', 'desc'));
            const seriesSnapshot = await getDocs(seriesQuery);
            seriesList.value = seriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Auto-select the most recent series
            if (seriesList.value.length > 0) {
                episode.value.seriesId = seriesList.value[0].id;
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

        const addCategory = () => {
            episode.value.categories.push({
                title: '',
                description: '',
            });
        };

        onMounted(async () => {
            await fetchSeries();
            await fetchConfig();
        });

        return { showDiscard, showModal, episode, seriesList, showContentForm, submitForm, save, addCategory, addMedia, episodeFinal, content, config, addScripture, removeScripture, submitContentForm };
    },
};
</script>
  
<style scoped>
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