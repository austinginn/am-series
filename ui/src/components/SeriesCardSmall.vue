<template>
  <div v-if="!desktop" class="series-card">
    <img :src="seriesImage" alt="Series Image" class="series-image" />
    <div class="series-info">
      <h2 class="series-title">{{ seriesTitle }}</h2>
      <p class="series-date"> {{ seriesStartDate }} to {{ seriesEndDate }} </p>
    </div>
  </div>
  <div v-if="desktop" class="series-card-small-desktop">
    <img :src="seriesImage" alt="series image" class="series-image-desktop" />
    <div class="series-info-desktop">
      <h2 class="series-title-desktop">{{ seriesTitle }}</h2>
      <p class="series-date-desktop">{{ seriesStartDate }} to {{ seriesEndDate }}</p>
    </div>
  </div>
</template>
    
<script>
import { ref, toRefs, onMounted, onUnmounted, computed } from 'vue';

export default {
  props: {
    seriesImage: String,
    seriesTitle: String,
    seriesDescription: String,
    seriesStartDate: String,
    seriesEndDate: String,
    seriesId: String,
  },
  setup(props) {
    const { seriesImage, seriesTitle, seriesDescription, seriesStartDate, seriesEndDate, seriesId } = toRefs(props);
    const windowWidth = ref(window.innerWidth);
    const desktop = computed(() => windowWidth.value >= 768);

    const onButtonClick = () => {
      console.log("button clicked");
    }

    const handleResize = () => {
      windowWidth.value = window.innerWidth;
    };

    onMounted(() => {
      window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
    });

    return {
      seriesImage,
      seriesTitle,
      seriesDescription,
      seriesStartDate,
      seriesEndDate,
      seriesId,
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

.series-date {
  margin: 0;
  font-size: 14px;
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
</style>