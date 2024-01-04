<template>
  <div class="episode-card">
    <div class="episode-image-container">
      <img v-if="!selected" :src="episodeImage" alt="Episode Image" class="episode-image" />
      <div class="episode" v-else>
        <iframe v-if='player == "youtube"' :src="embed" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen
          style="width: 100%; height: 100%;border-top-left-radius: 10px; border-top-right-radius: 10px;"></iframe>
        <iframe v-if='player == "vimeo"' :src="embed" frameborder="0" allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
          style="width: 100%; height: 100%; border-top-left-radius: 10px; border-top-right-radius: 10px;"></iframe>
        <div v-if="player == 'audio'" class="audio-container">
          <img :src="episodeImage" alt="Episode Image" class="episode-image" />
          <audio controls class="audio-bottom">
            <source :src="audio.url" type="audio/mpeg">
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    </div>
    <div class="episode-info">
      <h2>{{ episodeTitle }} <span v-if='sType && sType != "Default"'> - {{ sType }} {{ selected }}</span><span
          v-if='sType && sType == "Default"'> - {{ selected }}</span></h2>
      <p class="text-centered" v-if="!sType"> {{ episodeDate }} </p>
      <div v-if="scripture.length > 0" class="text-centered">
        <span>Scripture: </span>
        <span v-for="( script, index ) in scripture" :key="index"><a :href="script.url" target="_blank">{{
          script.reference }}</a> | </span>
      </div>
      <p class="text-centered" v-if="speaker && sType">Message by {{ speaker }} on {{ episodeDate }} </p>
    </div>
    <div v-if="!sType" class="episode-actions">
      <button class="button" v-for="( serviceType, index ) in  serviceTypes " :key="index"
        @click="onButtonClick(serviceType)">{{ serviceType }}</button>
    </div>
    <div v-if="sType" class="episode-types">
      <button class="button" v-for="( service, index ) in  serviceData[sType] " :key="index"
        @click="onServiceClick(index)">{{
          service.type }}</button>
      <button v-if="audio.flag" class="button" @click="onAudioClick()">Listen</button>
    </div>
    <div v-if='sType && sType != "Default"' class="episode-back">
      <button class="button" @click="onBackClick()">Back</button>
    </div>

  </div>
</template>
  
<script>
import { ref, toRefs, watch, onMounted } from 'vue';

export default {
  props: {
    episodeImage: String,
    episodeTitle: String,
    episodeDescription: String,
    episodeDate: String,
    serviceTypes: Array,
    serviceData: Object
  },
  setup(props) {
    const { episodeImage, episodeTitle, episodeDescription, serviceTypes, serviceData, episodeDate } = toRefs(props);

    const sType = ref(null);
    const selected = ref(null);
    const embed = ref(null);
    const player = ref(null);
    const speaker = ref(null);
    const scripture = ref([]);
    const audio = ref({ flag: false, index: null, url: null });

    const onButtonClick = (serviceType) => {
      // handle button click
      sType.value = serviceType;

      //check for audio
      for (let i = 0; i < serviceData.value[sType.value].length; i++) {
        if (serviceData.value[sType.value][i].audioUrl) {
          audio.value.flag = true;
          audio.value.index = i;
          audio.value.url = serviceData.value[sType.value][i].audioUrl;
          break;
        } else {
          audio.value.flag = false;
        }
      }

      //load first service in array
      selected.value = serviceData.value[sType.value][0].type;

      //get speaker
      speaker.value = serviceData.value[sType.value][0].speaker;

      //get scripture for first in the array
      scripture.value = [];
      for (let i = 0; i < serviceData.value[sType.value][0].scripture.length; i++) {

        scripture.value.push({
          reference: serviceData.value[sType.value][0].scripture[i].reference,
          url: serviceData.value[sType.value][0].scripture[i].url
        });
      }

      console.log("scripture", scripture.value);



      //get first video in array
      const videoUrl = serviceData.value[sType.value][0].videoUrl;
      if (serviceData.value[sType.value][0].videoPlatform === 'vimeo') {
        player.value = "vimeo";
        embed.value = getVimeoId(videoUrl);
        return;
      }
      if (serviceData.value[sType.value][0].videoPlatform === 'youtube') {
        player.value = "youtube";
        embed.value = getYoutubeId(videoUrl);
        return;
      }
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
      selected.value = serviceData.value[sType.value][index].type;

      //get scripture
      scripture.value = [];
      for (let i = 0; i < serviceData.value[sType.value][index].scripture.length; i++) {
        scripture.value.push({
          reference: serviceData.value[sType.value][index].scripture[i].reference,
          url: serviceData.value[sType.value][index].scripture[i].url
        });
      }

      const videoUrl = serviceData.value[sType.value][index].videoUrl;

      if (serviceData.value[sType.value][index].videoPlatform === 'vimeo') {
        player.value = "vimeo";
        embed.value = getVimeoId(videoUrl);
        return;
      }

      if (serviceData.value[sType.value][index].videoPlatform === 'youtube') {
        player.value = "youtube";
        embed.value = getYoutubeId(videoUrl);
        return;
      }
      //get youtube video id
    }

    const onBackClick = () => {
      sType.value = null;
      selected.value = null;
      embed.value = null;
      player.value = null;
      scripture.value = [];
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
      if (serviceTypes.value[0] == "Default") {
        onButtonClick(serviceTypes.value[0]);
      }
    });

    watch(() => props.episodeTitle, () => {
      console.log("episodeTitle changed")
      onBackClick();
      if (serviceTypes.value[0] == "Default") {
        onButtonClick(serviceTypes.value[0]);
      }
    });

    return {
      episodeImage,
      episodeTitle,
      episodeDescription,
      serviceTypes,
      serviceData,
      sType,
      selected,
      embed,
      player,
      speaker,
      scripture,
      audio,
      onAudioClick,
      onButtonClick,
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