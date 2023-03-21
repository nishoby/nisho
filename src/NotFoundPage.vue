<template>
    <div class="error-wrapper">
        <p class="error-title">Памылка 404</p>
        <p class="error-caption">
            Старонка не знойдзена...
            <br />
            <router-link :to="{ name: 'terms' }" class="error-link"> вярнуцца да словаў </router-link>
        </p>
        <img class="error-img" src="/assets/img/goat.png" alt="" />
    </div>
</template>
