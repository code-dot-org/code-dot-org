export default class CodeReviewDataApi {
  constructor(channelId, levelId, scriptId) {
    this.channelId = channelId;
    this.levelId = levelId;
    this.scriptId = scriptId;
  }

  getReviewablePeers() {
    // Enable when the API is ready
    // return $.ajax({
    //   url: `/code_review/peers_ready_for_review`,
    //   type: 'GET',
    //   data: {
    //     channel_id: this.channelId,
    //     level_id: this.levelId,
    //     script_id: this.scriptId
    //   }
    // });

    // For now returning stub data
    return [
      {
        id: 1,
        name: 'Jerry'
      },
      {
        id: 1,
        name: 'Karen'
      }
    ];
  }
}
