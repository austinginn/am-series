<template>
    <div class="from-container">
        <form @submit.prevent="updateConfig" class="config-form">
            <h2>Categories:</h2>
            <div v-for="(category, index) in config.categories" :key="index" class="input-group">
                <input v-model="config.categories[index]" placeholder="Category" />
                <button class="delete-button" @click.prevent="deleteCategory(index)">Delete</button>
            </div>
            <button class="add-button" @click.prevent="addCategory">Add Category</button>

            <!-- Repeat the above for speakers and subcats -->
            <h2>Sub Categories:</h2>
            <div v-for="(subcat, index) in config.subcats" :key="index" class="input-group">
                <input v-model="config.subcats[index]" placeholder="Sub Category" />
                <button class="delete-button" @click.prevent="deleteSubcat(index)">Delete</button>
            </div>
            <button class="add-button" @click.prevent="addSubcat">Add Sub Category</button>

            <!-- Repeat the above for speakers and subcats -->
            <h2>Speakers:</h2>
            <div v-for="(speaker, index) in config.speakers" :key="index" class="input-group">
                <input v-model="config.speakers[index]" placeholder="Speaker" />
                <button class="delete-button" @click.prevent="deleteSpeaker(index)">Delete</button>
            </div>
            <button class="add-button" @click.prevent="addSpeaker">Add Speaker</button>

            <!-- Live stream link-->
            <h2>Live Stream:</h2>
            <p>Leave this empty to disable the live stream helper.</p>
            <div class="input-group">
                <input v-model="config.liveUrl" placeholder="link to your live stream" />
            </div>

            <div class="button-container">
                <button class="save-button" type="submit">Save</button>
            </div>
        </form>
    </div>
</template>
  
<script>
import { ref, onMounted } from 'vue';
import { doc, setDoc, collection, serverTimestamp, Timestamp, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/main.js';

export default {
    setup() {
        const config = ref({
            categories: [],
            speakers: [],
            subcats: []
        });

        const configId = ref(null); // Add this line

        const fetchConfig = async () => {
            const configQuery = query(collection(db, 'config'));
            const querySnapshot = await getDocs(configQuery);

            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                config.value = docSnap.data();
                configId.value = docSnap.id; // Add this line
            }
        };

        const updateConfig = async () => {
            if (config.value.liveUrl && !config.value.liveUrl.startsWith('https://')) {
                // Invalidate the form
                config.value.liveUrl = 'https://' + config.value.liveUrl;
            }

            const docRef = doc(db, 'config', configId.value);
            await setDoc(docRef, config.value);
        };

        const addCategory = () => {
            config.value.categories.push('');
        };

        const addSubcat = () => {
            config.value.subcats.push('');
        };

        const addSpeaker = () => {
            config.value.speakers.push('');
        };

        const deleteCategory = (index) => {
            config.value.categories.splice(index, 1);
        };

        const deleteSubcat = (index) => {
            config.value.subcats.splice(index, 1);
        };

        const deleteSpeaker = (index) => {
            config.value.speakers.splice(index, 1);
        };

        // Repeat the above for speakers and subcats

        onMounted(fetchConfig);

        return {
            config,
            updateConfig,
            addCategory,
            deleteCategory,
            deleteSubcat,
            deleteSpeaker,
            addSpeaker,
            addSubcat
            // Include the methods for speakers and subcats
        };
    }
}
</script>

<style scoped>
.form-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f5f5f5;
}

.config-form {
    width: 80%;
    max-width: 600px;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.config-form h2 {
    margin-bottom: 20px;
}

.config-form input {
    width: 100%;
    padding: 10px;
    /* margin-bottom: 10px; */
    border: 1px solid #ddd;
    border-radius: 4px;
}


.input-group {
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.input-group input {
    flex-grow: 1;
    padding-right: 80px;
    /* make room for the button */
}

.delete-button {
    position: absolute;
    right: 0;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    background-color: #ff4d4d;
    color: white;
    cursor: pointer;
}

.delete-button:hover {
    background-color: #cc0000;
}

.add-button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    background-color: #007BFF;
    /* blue background */
    color: white;
    cursor: pointer;
}

.add-button:hover {
    background-color: #0056b3;
    /* darker blue on hover */
}

.save-button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    background-color: #28a745;
    /* green background */
    color: white;
    cursor: pointer;
    width: 80px;
}

.save-button:hover {
    background-color: #1e7e34;
    /* darker green on hover */
}

.button-container {

    display: flex;
    justify-content: flex-end;
}
</style>