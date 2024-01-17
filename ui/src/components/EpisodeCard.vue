<template>
  <div class="episode-card">
    <div class="episode-image-container">
      <img  :src="content.image" alt="Episode Image" class="episode-image" />
      <div class="episode" v-if="selectedMedia">
        <iframe v-if='selectedMedia.videoPlatform == "youtube"' :src="getYoutubeId(selectedMedia.videoUrl)"
          frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          style="width: 100%; height: 100%;border-top-left-radius: 10px; border-top-right-radius: 10px;"></iframe>
        <iframe v-if='selectedMedia.videoPlatform == "vimeo"' :src="getVimeoId(selectedMedia.videoUrl)" frameborder="0"
          allow="autoplay; fullscreen; picture-in-picture" allowfullscreen
          style="width: 100%; height: 100%; border-top-left-radius: 10px; border-top-right-radius: 10px;"></iframe>
        <div v-if="player == 'audio'" class="audio-container">
          <img :src="content.image" alt="Episode Image" class="episode-image" />
          <audio controls class="audio-bottom">
            <source :src="audio.url" type="audio/mpeg">
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    </div>
    <div class="episode-info">
      <h2>{{ content.title }} <span v-if='sType && sType != "Default"'> - {{ sType }} {{ selectedMedia.subCategory
      }}</span><span v-if='sType && sType == "Default"'> - {{ selected }}</span></h2>
      <p class="text-centered" v-if="!sType"> {{ content.date }} </p>
      <div v-if="selectedMedia && selectedMedia.scriptures.length > 0" class="text-centered">
        <span>Scripture: </span>
        <span v-for="( script, index ) in selectedMedia.scriptures" :key="index"><a :href="script.link" target="_blank">{{
          script.reference }}</a> <span v-if="index < selectedMedia.scriptures.length - 1"> | </span> </span>
      </div>
      <p class="text-centered" v-if="sType">Message by {{ selectedMedia.speaker }} on {{ content.date }} </p>
    </div>
    <div v-if="!sType" class="episode-actions">
      <button class="button" v-for="( category, index ) in  contentCategories " :key="index"
        @click="onCategoryClick(category)">{{ category }}</button>
    </div>
    <div v-if='sType && !onlyOne' class="episode-types">
      <button v-if="mediaArray.length > 1" class="button" v-for="( media, index ) in  mediaArray " :key="index"
        @click="onServiceClick(index)">{{
          media.subCategory }}</button>
      <button v-if="audio.flag" class="button" @click="onAudioClick()">Listen</button>
    </div>
    <div v-if='sType && !onlyOne' class="episode-back">
      <button class="button" @click="onBackClick()">Back</button>
    </div>

  </div>
</template>
  
<script>
import { ref, toRefs, watch, onMounted } from 'vue';

export default {
  props: {
    content: Object,
    mediaId: String
  },
  setup(props) {
    const { content, mediaId } = toRefs(props);
    const contentCategories = ref([]);
    const sType = ref(null);
    const mediaArray = ref([]);
    const selectedMedia = ref(null);
    const selected = ref(null);
    const embed = ref(null);
    const player = ref(null);
    const speaker = ref(null);
    const scripture = ref([]);
    const audio = ref({ flag: false, index: null, url: null });
    const onlyOne = ref(false);

    const onCategoryClick = (category) => {
      // handle button click
      sType.value = category;
      //get all media with same category into array
      mediaArray.value = [];
      for (let i = 0; i < content.value.media.length; i++) {
        if (content.value.media[i].category == category) {
          mediaArray.value.push(content.value.media[i]);
        }
      }

      //check for audio
      // for (let i = 0; i < content.value[sType.value].length; i++) {
      //   if (serviceData.value[sType.value][i].audioUrl) {
      //     audio.value.flag = true;
      //     audio.value.index = i;
      //     audio.value.url = serviceData.value[sType.value][i].audioUrl;
      //     break;
      //   } else {
      //     audio.value.flag = false;
      //   }
      // }

      //load first service in array
      selected.value = mediaArray.value[0].subCategory;
      selectedMedia.value = mediaArray.value[0];
      console.log(selected.value)
    };

    const onAudioClick = () => {
      console.log("audio clicked");
      console.log(audio.value);

      selected.value = "Audio";

      //get scripture for
      scripture.value = [];
      for (let i = 0; i < serviceData.value[sType.value][audio.value.index].scripture.length; i++) {
        scripture.value.push({
          reference: serviceData.value[sType.value][audio.value.index].scripture[i].reference,
          url: serviceData.value[sType.value][audio.value.index].scripture[i].url
        });
      }

      player.value = "audio";

    }

    const onServiceClick = (index) => {
      //handle service click
      selectedMedia.value = mediaArray.value[index];
    }

    const onBackClick = () => {
      sType.value = null;
      selectedMedia.value = null;
    }

    const getVimeoId = (url) => {
      // Extract the video ID from the URL
      const videoId = url.split('vimeo.com/')[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }

    const getYoutubeId = (url) => {
      //get youtube video id
      let videoId = url.split('v=')[1];
      const ampersandPosition = videoId.indexOf('&');
      if (ampersandPosition != -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
      return `https://www.youtube.com/embed/${videoId}?modestbranding=1`;;
    }

    onMounted(() => {
      console.log("mounted");
      console.log(content.value);
      console.log(mediaId.value);



      //get the service categories
      for (let i = 0; i < content.value.media.length; i++) {
        if (!contentCategories.value.includes(content.value.media[i].category)) {
          contentCategories.value.push(content.value.media[i].category);
        }
      }
      console.log(contentCategories.value);

      if(mediaId.value) {
        for (let i = 0; i < content.value.media.length; i++) {
          if (content.value.media[i].id == mediaId.value) {
            onCategoryClick(content.value.media[i].category);
            selectedMedia.value = content.value.media[i];
            break;
          }
        }
      }

      if (content.value.media.length == 1) {
        console.log("here");
        onCategoryClick(contentCategories.value[0]);
        onlyOne.value = true;
      }

    });

    watch(() => props.content, () => {
      console.log("episodeTitle changed")
      onBackClick();
      contentCategories.value = [];
      onlyOne.value = false;

      //get the service categories
      for (let i = 0; i < content.value.media.length; i++) {
        if (!contentCategories.value.includes(content.value.media[i].category)) {
          contentCategories.value.push(content.value.media[i].category);
        }
      }
      console.log(contentCategories.value);

      if (content.value.media.length == 1) {
        console.log("here");
        onCategoryClick(contentCategories.value[0]);
        onlyOne.value = true;
      }


    });

    return {
      selectedMedia,
      onlyOne,
      sType,
      mediaArray,
      content,
      contentCategories,
      audio,
      getVimeoId,
      getYoutubeId,
      onAudioClick,
      onCategoryClick,
      onServiceClick,
      onBackClick
    };
  },
};
</script>
  
<style scoped>
.episode-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 10px;
  /* padding: 20px; */
  margin: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  padding-bottom: 15px;
}

.episode-info {
  padding-left: 10px;
  padding-right: 10px;
  text-align: center;
}

.episode-image-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  /* for 16:9 aspect ratio */
}

.episode-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.episode {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.episode-title {
  margin-top: 20px;
  font-size: 20px;
  font-weight: bold;
}

.episode-description {
  margin-top: 10px;
  font-size: 16px;
  text-align: center;
}

.button {
  display: inline-block;
  padding: 10px 20px;
  margin: 10px 2px;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  background-color: rgb(190, 32, 46);
}

.button:hover {
  background-color: rgba(190, 32, 45, 0.526);
}

.episode-types {
  padding-bottom: 35px;
}

.episode-back {
  position: absolute;
  bottom: 0;
  left: 10px;
}

.text-centered {
  text-align: center;
}

.audio-bottom {
  position: absolute;
  bottom: 0;
  width: 100%;
}
</style>