/**
 * Stash Plugin Registry - Aggregates 75+ community plugin sources
 * Cannibalized from all stash plugin index.yml repositories
 */
const PLUGIN_SOURCES = [
  { name: 'Stash Official', url: 'https://stashapp.github.io/CommunityScripts/stable/index.yml', type: 'official' },
  { name: 'Feederbox Plugins', url: 'https://feederbox826.github.io/plugins/main/index.yml', type: 'community' },
  { name: 'Feederbox Themes', url: 'https://feederbox826.github.io/themes/main/index.yml', type: 'theme' },
  { name: 'Feederbox StashList', url: 'https://feederbox826.github.io/stashlist/main/index.yml', type: 'community' },
  { name: '7dJx1qP Plugins', url: 'https://dogmadragon.github.io/7dJx1qP-stash-plugins/main/index.yml', type: 'community' },
  { name: 'DogmaDragon Plugins', url: 'https://dogmadragon.github.io/plugins/main/index.yml', type: 'community' },
  { name: 'Valkyr JS', url: 'https://valkyr-js.github.io/stash-plugins/main/index.yml', type: 'community' },
  { name: 'Valkyr JS Private', url: 'https://valkyr-js.github.io/stash-plugins-private/index.yml', type: 'community' },
  { name: 'Serechops Stash', url: 'https://serechops.github.io/Serechops-Stash/index.yml', type: 'community' },
  { name: 'DTT Battle', url: 'https://dtt-git.github.io/stash-battle/main/index.yml', type: 'community' },
  { name: 'Stash of Awesomeness', url: 'https://stash-of-awesomeness.github.io/stash-plugins/main/index.yml', type: 'community' },
  { name: 'WithoutPants Prototypes', url: 'https://withoutpants.github.io/stash-plugin-prototypes/main/index.yml', type: 'official' },
  { name: 'Xio Stash', url: 'https://xiosensei.github.io/Xio-Stash/index.yml', type: 'community' },
  { name: 'Servbot91 Ascension', url: 'https://raw.githubusercontent.com/Servbot91/Ascension/main/plugins/manifest.yml', type: 'community' },
  { name: 'Servbot91 Deck Viewer', url: 'https://raw.githubusercontent.com/Servbot91/Deck-Viewer/main/plugins/manifest.yml', type: 'community' },
  { name: 'Servbot91 DiceR', url: 'https://raw.githubusercontent.com/Servbot91/DiceR/refs/heads/main/plugins/manifest.yml', type: 'community' },
  { name: 'Servbot91 HotorNot', url: 'https://raw.githubusercontent.com/Servbot91/HotorNot-Stat-Addon/main/plugins/manifest.yml', type: 'community' },
  { name: 'Stash Interactive Tools (alpha)', url: 'https://raw.githubusercontent.com/xtc1337/StashInteractiveTools/alpha/stash-alpha.yml', type: 'community' },
  { name: 'Stash Interactive Tools (next)', url: 'https://raw.githubusercontent.com/xtc1337/StashInteractiveTools/next/stash-next.yml', type: 'community' },
  { name: 'Stash Interactive Tools', url: 'https://raw.githubusercontent.com/xtc1337/StashInteractiveTools/next/stash.yml', type: 'community' },
  { name: 'Stash2Plex', url: 'https://raw.githubusercontent.com/trek-e/Stash2Plex/main/index.yml', type: 'bridge' },
  { name: 'StashApp Tools', url: 'https://raw.githubusercontent.com/W0lfieW0lf/StashApp-Tools/main/_site/index.yml', type: 'community' },
  { name: 'StashGIFs', url: 'https://raw.githubusercontent.com/evolite/stashgifs/master/index.yml', type: 'community' },
  { name: 'Alpha4Twelve Plugins', url: 'https://raw.githubusercontent.com/alph4twelve/stash-plugins/main/index.yml', type: 'community' },
  { name: 'd0t-d0t-d0t Repo', url: 'https://raw.githubusercontent.com/d0t-d0t-d0t/stash-repo/main/index.yml', type: 'community' },
  { name: 'ed36080666 BG Images', url: 'https://raw.githubusercontent.com/ed36080666/stashapp_plugin_background_images/main/index.yml', type: 'theme' },
  { name: 'ed36080666 Recommendations', url: 'https://raw.githubusercontent.com/ed36080666/stashapp_recommendation_engine/main/index.yml', type: 'community' },
  { name: 'ed36080666 Plex Theme', url: 'https://raw.githubusercontent.com/ed36080666/stashapp_theme_plex_redux/main/index.yml', type: 'theme' },
  { name: 'ed36080666 Star Ratings', url: 'https://raw.githubusercontent.com/ed36080666/stashapp_theme_star_ratings/main/index.yml', type: 'theme' },
  { name: 'CarrotWaxr Plugins', url: 'https://carrotwaxr.github.io/stash-plugins/stable/index.yml', type: 'community' },
  { name: 'CarrotWaxr Sense', url: 'https://carrotwaxr.github.io/stash-sense/plugin/index.yml', type: 'community' },
  { name: 'BlackStar3000 Plugins', url: 'https://blackstar3000.github.io/stash-plugins-blackstar/main/index.yml', type: 'community' },
  { name: 'Whisparr Bridge', url: 'https://eviepayne.github.io/whisparr-bridge/master/index.yml', type: 'bridge' },
  { name: 'F4bio Plugins', url: 'https://f4bio.github.io/stash-plugins/main/index.yml', type: 'community' },
  { name: 'HashGambit Scripts', url: 'https://hashgambit.github.io/StashScripts/stable/index.yml', type: 'community' },
  { name: 'HippoChapel Plugins', url: 'https://hippochapel.github.io/hippo-stash-plugins/main/index.yml', type: 'community' },
  { name: 'Hisoka343 Subtitles', url: 'https://hisoka343.github.io/stashapp-subtitle-plugin-support/main/index.yml', type: 'community' },
  { name: 'IAmKontrast Plugins', url: 'https://iamkontrast.github.io/stash-plugins/main/index.yml', type: 'community' },
  { name: 'Jay4242 Whisper', url: 'https://jay4242.github.io/whisper_transcribe/main/index.yml', type: 'community' },
  { name: 'jsmthy Plugins', url: 'https://jsmthy.github.io/stash-plugins/main/index.yml', type: 'community' },
  { name: 'Kokkeng1 Plugins', url: 'https://kokkeng1.github.io/stash_plugin_custom/index.yml', type: 'community' },
  { name: 'LowGrade12 Hot-or-Not', url: 'https://lowgrade12.github.io/hot-or-not/main/index.yml', type: 'community' },
  { name: 'Lurking987 Plugins', url: 'https://lurking987.github.io/stash-plugins/main/index.yml', type: 'community' },
  { name: 'MidnightRider', url: 'https://minasukihikimuna.github.io/MidnightRider-Stash/index.yml', type: 'community' },
  { name: 'Misofist Plugins', url: 'https://misofist.github.io/misofist-stash-plugins/index.yml', type: 'community' },
  { name: 'MRStashRepository', url: 'https://mrtoadx.github.io/MRStashRepository/main/index.yml', type: 'community' },
  { name: 'Opietaylor911 Plugins', url: 'https://opietaylor911.github.io/StashPlugins/main/index.yml', type: 'community' },
  { name: 'OrdureConnoisseur', url: 'https://ordureconnoisseur.github.io/plugins/main/index.yml', type: 'community' },
  { name: 'PitaminVorn Plugins', url: 'https://pitaminvorn.github.io/stashapp-plugins-repo/main/index.yml', type: 'community' },
  { name: 'QxxxGit Plugins', url: 'https://qxxxgit.github.io/stash-plugins/index.yml', type: 'community' },
  { name: 'Rchrdcho Plugins', url: 'https://rchrdcho.github.io/StashPlugins/main/index.yml', type: 'community' },
  { name: 'RollaInKraus Plugins', url: 'https://rollainkraus.github.io/stash-plugins/main/index.yml', type: 'community' },
  { name: 'Rosa Umineko Scripts', url: 'https://rosa-umineko.github.io/CommunityScripts/stable/index.yml', type: 'community' },
  { name: 's3l3ct3dloves Plugins', url: 'https://s3l3ct3dloves.github.io/stashPlugins/stable/index.yml', type: 'community' },
  { name: 'SanjisWe Plugins', url: 'https://sanjiswe.github.io/plugins/main/index.yml', type: 'community' },
  { name: 'SecondFolder Plugins', url: 'https://secondfolder.github.io/stash-plugins/stable/index.yml', type: 'community' },
  { name: 'ShackOfNoReturn Ratings', url: 'https://shackofnoreturn.github.io/stashapp-plugin-advanced-scene-ratings/main/index.yml', type: 'community' },
  { name: 'ShineKokonuichi Plugins', url: 'https://shinekokunoichi.github.io/stash-plugins/main/index.yml', type: 'community' },
  { name: 'SneakyNinja256', url: 'https://sneakyninja256.github.io/stash-plugins/stable/index.yml', type: 'community' },
  { name: 'SpaceYuck Plugins', url: 'https://spaceyuck.github.io/stash-plugins/index.yml', type: 'community' },
  { name: 'STG-Annon Scripts', url: 'https://stg-annon.github.io/StashScripts/stable/index.yml', type: 'community' },
  { name: 'Surging9143', url: 'https://surging9143.codeberg.page/index.yml', type: 'community' },
  { name: 'ThisManyBoyfriends2', url: 'https://thismanyboyfriends2.github.io/stash-plugins/main/index.yml', type: 'community' },
  { name: 'Dracula Theme', url: 'https://uncertainmongoose.github.io/dracula-for-stash/index.yml', type: 'theme' },
  { name: 'VoidImproper Plugins', url: 'https://voidimproper.github.io/stash-plugins/main/index.yml', type: 'community' },
  { name: 'ZzzInsCode Plugins', url: 'https://zzzinscode.github.io/stashapp-plugins/main/index.yml', type: 'community' },
  { name: 'CoderDudeo Plugins', url: 'https://coderdudeo.github.io/CoderDudeo-Stash-Plugins/index.yml', type: 'community' },
  { name: 'CrudeCreations Plugins', url: 'https://crudecreations.github.io/stash-plugins/stable/plugins.yaml', type: 'community' },
  { name: 'DManitoba Plugins', url: 'https://dmanitoba.github.io/stash_plugins/main/index.yml', type: 'community' },
  { name: 'Dopeniko Scripts', url: 'https://dopeniko.github.io/stash-scripts/main/index.yml', type: 'community' },
  { name: 'DruidBlack Plugin', url: 'https://druidblack.github.io/stash-plugin/main/index.yml', type: 'community' },
  { name: 'CeeQuester Scripts', url: 'https://ceequester.github.io/CommunityScripts/stable/index.yml', type: 'community' },
  { name: 'CodDDarrr Plugins', url: 'https://codddarrr.github.io/stashapp-plugins-repo/main/index.yml', type: 'community' },
  { name: 'AtreeManDork', url: 'https://atreemandork.github.io/index.yml', type: 'community' },
]

export function getPluginSources() {
  return PLUGIN_SOURCES
}

export function getPluginsByType(type) {
  return PLUGIN_SOURCES.filter(p => p.type === type)
}

export function getPluginSource(url) {
  return PLUGIN_SOURCES.find(p => p.url === url)
}

export { PLUGIN_SOURCES }
