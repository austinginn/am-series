<template>
  <div v-if="!desktop || small" class="series-card" @click="onButtonClick(series.id)">
    <img :src="series.image" alt="Series Image" class="series-image" />
    <div class="series-info">
      <h2 class="series-title">{{ series.title }}</h2>
      <!-- <p class="series-desc"> {{ truncatedDescription }} </p>
      <button class="show-more-button" v-if="seriesDescription.length > 125" @click="showFullDescription = !showFullDescription">
        {{ showFullDescription ? 'Show less' : 'Show more' }}
      </button> -->
      <p class="series-date"> {{ series.startDate }} to {{ series.endDate }} </p>
    </div>
  </div>
  <div v-else class="series-card-small-desktop" @click="onButtonClick(series.id)">
    <img :src="series.image" alt="series image" class="series-image-desktop" />
    <div class="series-info-desktop">
      <h2 class="series-title-desktop">{{ series.title }}</h2>
      <p class="series-desc-desktop"> {{ truncatedDescription }} </p>
      <button class="show-more-button" v-if="series.description.length > 125" @click.stop="showFullDescription = !showFullDescription">
        {{ showFullDescription ? 'Show less' : 'Show more' }}
      </button>
      <p class="series-date-desktop">{{ series.startDate }} to {{ series.endDate }}</p>
    </div>
  </div>
</template>
    
<script>
import { ref, toRefs, onMounted, onUnmounted, computed } from 'vue';

export default {
  props: {
    series: Object,
    small: Boolean,
  },
  setup(props, { emit }) {
    const { series } = toRefs(props);
    const windowWidth = ref(window.innerWidth);
    const desktop = computed(() => windowWidth.value >= 768);
    const showFullDescription = ref(false);

    const onButtonClick = (seriesId) => {
      console.log("button clicked");
      console.log(seriesId);
      emit('select-series', seriesId);
    }

    const handleResize = () => {
      windowWidth.value = window.innerWidth;
    };

    onMounted(() => {
      window.addEventListener('resize', handleResize);
      console.log(series.value);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
    });

    const truncatedDescription = computed(() => {
      if (showFullDescription.value) {
        return props.series.description;
      } else if (props.series.description.length > 125) {
        let truncated = props.series.description.substring(0, 125);
        let lastSpaceIndex = truncated.lastIndexOf(' ');
        if (lastSpaceIndex !== -1) {
          truncated = truncated.substring(0, lastSpaceIndex);
        }
        return truncated + '...';
      } else {
        return props.series.description;
      }
    });

    return {
      showFullDescription,
      truncatedDescription,
      series,
      desktop,
      onButtonClick,
    };
  },
};
</script>
    
<style scoped>
.series-card {
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

.series-image {
  width: 200px;
  object-fit: cover;
  margin-right: 10px;
  flex-shrink: 0;
  border-radius: 10px;
}

.series-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  text-align: center;
}

.series-title {
  margin: 0;
  font-size: 18px;
}

.series-title-desktop {
  /* margin: 0;
  font-size: 18px; */
  margin-bottom: 10px;
}

.series-date {
  margin: 0;
  font-size: 14px;
}

.series-desc-desktop {
  margin: 0;
  font-size: 14px;
  text-align: left;

}

.series-card:hover {
  background-color: rgb(190, 32, 46);
  color: white;
  cursor: pointer;
}

.series-card-small-desktop {
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

.series-image-desktop {
  width: 100%;
  object-fit: cover;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.series-card-small-desktop:hover {
  background-color: rgb(190, 32, 46);
  color: white;
  cursor: pointer;
}

.series-info-desktop {
  padding: 10px;
  text-align: center;
}
.show-more-button {
  padding: 5px;
  border: none;
  background-color: #677687;
  color: white;
  cursor: pointer;
  text-decoration: none;
  font-size: 12px;
  border-radius: 5px;
  margin-top: 5px;
}

.show-more-button:hover {
  background-color: #4d5a6e;
}
</style>