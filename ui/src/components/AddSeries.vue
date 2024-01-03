<template>
  <div class="container">
    <form @submit.prevent="submitForm" class="series-form">
      <h1>New Series</h1>
      <label for="seriesTitle">Series Title:</label>
      <input id="seriesTitle" v-model="series.title" type="text" required />

      <label for="seriesDescription">Series Description:</label>
      <textarea id="seriesDescription" v-model="series.description" required></textarea>

      <label for="seriesStartDate">Start Date:</label>
      <input id="seriesStartDate" v-model="series.startDate" type="date" required />

      <label for="seriesEndDate">End Date:</label>
      <input id="seriesEndDate" v-model="series.endDate" type="date" required />

      <label for="seriesImage">Series Image:</label>
      <input id="seriesImage" type="file" @change="onFileChange" required />

      <button type="submit">Create Series</button>
    </form>
  </div>
</template>
  
<script>
import { ref } from 'vue';
import { doc, setDoc, addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/main.js';

export default {
  setup() {
    const series = ref({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      image: null,
      id: null,
      timestamp: null
    });

    const onFileChange = (e) => {
      series.value.image = e.target.files[0];
    };

    const submitForm = async () => {
      console.log(series.value);

      const uid = generateUID();

      //store image
      const imageRef = storageRef(storage, `series/${uid}`);
      const metadata = {
        contentType: series.value.image.type,
      };
      const uploadTask = uploadBytesResumable(imageRef, series.value.image, metadata);

      // Wait for the upload to complete
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            // Handle the upload task progress here
          },
          (error) => {
            // Handle unsuccessful uploads
            console.error(error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            series.value.image = downloadURL;

            // Convert start date string to JavaScript Date
            if (typeof series.value.startDate === 'string') {
              series.value.startDate = new Date(series.value.startDate);
            }

            series.value.startDate = new Date(series.value.startDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            //end date
            if (typeof series.value.endDate === 'string') {
              series.value.endDate = new Date(series.value.endDate);
            }
            // Convert JavaScript Date to Firebase Timestamp
            series.value.timestamp = Timestamp.fromDate(series.value.endDate);

            series.value.endDate = new Date(series.value.endDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            const seriesRef = doc(db, 'series', uid);
            await setDoc(seriesRef, {
              title: series.value.title,
              description: series.value.description,
              startDate: series.value.startDate,
              endDate: series.value.endDate,
              timestamp: series.value.timestamp,
              id: uid,
              image: downloadURL
            });
            
            resolve();
          });
      });
    };

    function generateUID() {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      for (let i = 0; i < 20; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }

    return {
      series,
      onFileChange,
      submitForm
    };
  }
};
</script>

<style scoped>
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

.series-form button {
  margin-top: 20px;
  padding: 10px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.series-form button:hover {
  background-color: #0056b3;
}
</style>