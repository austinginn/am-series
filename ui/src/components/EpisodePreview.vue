<template>
    <div class="episode-card">
        <div class="episode-image-container">
            <img v-if="!selected" :src="episode.image" alt="Episode Image" class="episode-image" />
            <div class="episode" v-else>
                <iframe v-if='player == "youtube"' :src="embed" frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    style="width: 100%; height: 100%;border-top-left-radius: 10px; border-top-right-radius: 10px;"></iframe>
                <iframe v-if='player == "vimeo"' :src="embed" frameborder="0"
                    allow="autoplay; fullscreen; picture-in-picture" allowfullscreen
                    style="width: 100%; height: 100%; border-top-left-radius: 10px; border-top-right-radius: 10px;"></iframe>
                <div v-if="player == 'audio'" class="audio-container">
                    <img :src="episode.image" alt="Episode Image" class="episode-image" />
                    <audio controls class="audio-bottom">
                        <source :src="audio.url" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            </div>
        </div>
        <div class="episode-info">
            <h2>{{ episode.title }} <span v-if="sType"> - {{ sType }} {{ selected }}</span></h2>
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
        <div v-if="sType" class="episode-back">
            <button class="button" @click="onBackClick()">Back</button>
        </div>

    </div>
</template>
<script>
import { ref, toRefs, onMounted, onUnmounted, computed } from 'vue';

export default {
    props: {
        episode: Object,
    },
    setup(props, { emit }) {
        const { episode } = toRefs(props);
        const selected = ref(null);
        console.log("in preview");
        console.log(episode);



        return {
            episode,
            selected
        };
    },
};
</script>