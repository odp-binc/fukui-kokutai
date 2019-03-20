<template>
  <aside class="sidebar">
    <ul>
      <li>リスト1</li>
      <li>リスト2</li>
      <li>リスト3</li>
      <li>リスト4</li>
      <li>リスト5</li>
      <li>リスト6</li>
      <li>リスト7</li>
      <li>リスト8</li>
      <li>リスト9</li>
      <li>リスト10</li>
      <li>リスト11</li>
      <li>リスト12</li>
      <li>リスト13</li>
      <li>リスト14</li>
      <li>リスト15</li>
      <li>リスト16</li>
      <li>リスト17</li>
      <li>リスト18</li>
      <li>リスト19</li>
      <li>リスト20</li>
      <li>リスト21</li>
      <li>リスト22</li>
      <li>リスト23</li>
      <li>リスト24</li>
      <li>リスト25</li>
      <li>リスト26</li>
      <li>リスト27</li>
      <li>リスト28</li>
      <li>リスト29</li>
      <li>リスト30</li>
      <li>リスト31</li>
      <li>リスト32</li>
      <li>リスト33</li>
      <li>リスト34</li>
      <li>リスト35</li>
      <li>リスト36</li>
      <li>リスト37</li>
      <li>リスト38</li>
      <li>リスト39</li>
      <li>リスト40</li>
      <li>リスト41</li>
      <li>リスト42</li>
      <li>リスト43</li>
      <li>リスト44</li>
      <li>リスト45</li>
      <li>リスト46</li>
      <li>リスト47</li>
      <li>リスト48</li>
      <li>リスト49</li>
      <li>リスト50</li>
      <li>リスト51</li>
      <li>リスト52</li>
      <li>リスト53</li>
      <li>リスト54</li>
      <li>リスト55</li>
      <li>リスト56</li>
      <li>リスト57</li>
      <li>リスト58</li>
      <li>リスト59</li>
      <li>リスト60</li>
      <li>リスト61</li>
      <li>リスト62</li>
      <li>リスト63</li>
      <li>リスト64</li>
      <li>リスト65</li>
      <li>リスト66</li>
      <li>リスト67</li>
      <li>リスト68</li>
      <li>リスト69</li>
      <li>リスト70</li>
      <li>リスト71</li>
      <li>リスト72</li>
      <li>リスト73</li>
      <li>リスト74</li>
      <li>リスト75</li>
      <li>リスト76</li>
      <li>リスト77</li>
      <li>リスト78</li>
      <li>リスト79</li>
      <li>リスト80</li>
      <li>リスト81</li>
      <li>リスト82</li>
      <li>リスト83</li>
      <li>リスト84</li>
      <li>リスト85</li>
      <li>リスト86</li>
      <li>リスト87</li>
      <li>リスト88</li>
      <li>リスト89</li>
      <li>リスト90</li>
      <li>リスト91</li>
      <li>リスト92</li>
      <li>リスト93</li>
      <li>リスト94</li>
      <li>リスト95</li>
      <li>リスト96</li>
      <li>リスト97</li>
      <li>リスト98</li>
      <li>リスト99</li>
      <li>リスト100</li>
      <li>リスト101</li>
      <li>リスト102</li>
      <li>リスト103</li>
    </ul>
  </aside>
</template>
<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component
export default class Sidebar extends Vue {}
</script>
<style lang="postcss">
@import "@/styles/defines.css";

.sidebar {
  position: fixed;
  top: $navbar-height;
  background: #999999;
  line-height: 1.5em;
  width: 180px;
  min-width: 45px;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;

  ul {
    list-style: none;
    padding: 0;
  }
}
</style>
