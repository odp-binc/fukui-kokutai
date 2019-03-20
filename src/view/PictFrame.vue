<template>
  <div class="pict-frame">
    <p>
      スマートフォンやタブレットをご利用の方は、撮影アプリ「９．９８スタジアム　フォトアプリ」をご利用ください。
    </p>
    <p class="link">
      <a
        href="https://itunes.apple.com/jp/app/%EF%BC%99-%EF%BC%99%EF%BC%98%E3%82%B9%E3%82%BF%E3%82%B8%E3%82%A2%E3%83%A0-%E3%83%95%E3%82%A9%E3%83%88%E3%82%A2%E3%83%97%E3%83%AA/id1384373662?mt=8"
        class="appstore"
      />
      <a
        href="https://play.google.com/store/apps/details?id=com.premiumartsinc.kiryu&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
        class="googleplay"
        ><img
          alt="Google Play で手に入れよう"
          src="https://play.google.com/intl/ja_jp/badges/images/generic/ja_badge_web_generic.png"
      /></a>
    </p>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component
export default class PictFrame extends Vue {}
</script>
<style lang="postcss">
.pict-frame p {
  margin: 1em;
  &.link {
    text-align: center;
    a {
      vertical-align: middle;
      display: inline-block;
      &.appstore {
        overflow: hidden;
        background: url(https://linkmaker.itunes.apple.com/assets/shared/badges/ja-jp/appstore-lrg.svg)
          no-repeat;
        width: 135px;
        height: 40px;
        background-size: contain;
      }
      &.googleplay img {
        vertical-align: middle;
        height: 60px; /* GooglePlayのバッジには下記の余白が含まれているので、appstoreの高さの1.5倍を指定する。
                       * > バッジの周囲には、バッジの高さの 4 分の 1 に相当する余白を設ける必要があります。
                       * > https://play.google.com/intl/ja_jp/badges/
                       */
      }
    }
  }
}
</style>
