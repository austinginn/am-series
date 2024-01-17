<template>
    <div v-if="!desktop || small" class="episode-card-small" @click="handleCardClick(content.id)">
        <img :src="content.image" alt="Episode image" class="episode-image" />
        <div class="episode-info">
            <h2 class="episode-title">{{ content.title }}</h2>
            <p class="episode-date">{{ content.date }}</p>
        </div>
    </div>
    <div v-else class="episode-card-small-desktop" @click="handleCardClick(content.id)">
        <img :src="content.image" alt="Episode image" class="episode-image-desktop" />
        <div class="episode-info-desktop">
            <h2 class="episode-title-desktop">{{ content.title }}</h2>
            <p class="episode-date-desktop">{{ content.date }}</p>
        </div>
    </div>
</template>
<script>
import { ref, toRefs, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';

export default {
    props: {
        content: Object,
        small: Boolean
    },
    setup(props, { emit }) {
        const { content } = toRefs(props);
        const router = useRouter(); // Initialize router
        const windowWidth = ref(window.innerWidth);
        const desktop = computed(() => windowWidth.value >= 768);
        
        const handleResize = () => {
            windowWidth.value = window.innerWidth;
        };

        onMounted(() => {
            window.addEventListener('resize', handleResize);
        });

        onUnmounted(() => {
            window.removeEventListener('resize', handleResize);
        });

        const handleCardClick = (episodeId) => {
            console.log(episodeId);
            //navigate to home with episodeId
            emit('select-episode', episodeId)

        }

        return {
            content,
            desktop,
            handleCardClick
        }
    }
}
</script>

<style scoped>
.episode-card-small {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    border: 1px solid #ddd;
    margin: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    border-radius: 10px;
    transition: background-color 0.3s ease;
}

.episode-image {
    width: 200px;
    object-fit: cover;
    margin-right: 10px;
    flex-shrink: 0;
border-radius: 10px;
}

.episode-info {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    text-align: center;
}

.episode-title {
    margin: 0;
    font-size: 18px;
}

.episode-date {
    margin: 0;
    font-size: 14px;
}

.episode-card-small:hover {
    background-color: rgb(190, 32, 46);
    color: white;
    cursor: pointer;
}

.episode-card-small-desktop {
    /* position: relative;
    display: flex;
    flex-direction: column;
    align-items: center; */
    /* width: 250px; */
    border: 1px solid #ddd;
    border-radius: 10px;
    margin: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    transition: background-color 0.3s ease;
}

.episode-image-desktop {
    width: 100%;
    object-fit: cover;
    border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.episode-card-small-desktop:hover {
    background-color: rgb(190, 32, 46);
    color: white;
    cursor: pointer;
}
.episode-info-desktop {
    padding: 10px;
    text-align: center;
}
</style>