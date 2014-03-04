var wcWidth = 960,
 wcHeight = 600;

onLoad = function() {
  $('#main').submit(formHandler);
  $('#ctlUsername').change(validateUsername);
  $('#ctlUsername').keyup(validateUsername);
  $('#btnGo').attr('disabled', true);
  attachLoadingAlertOnUnload();
  hideLoadingMessage();
};

validateUsername = function() {
  var usernameField = $(this);
  if (usernameField.val() === "") {
    $('#fgUsername').addClass('has-error has-feedback');
    $('#btnGo').attr('disabled', true);
  }
  else
  {
    $('#fgUsername').removeClass('has-error has-feedback');
    $('#btnGo').removeAttr('disabled');
  }
};

hideLoadingMessage = function() {
  $('#loading_message').slideUp(500);
};

attachLoadingAlertOnUnload = function(){
  window.onbeforeunload = showLoadingMessage;
}

showLoadingMessage = function(){
  $('#loading_message').slideDown(500);
}

formHandler = function(event) {
  event.preventDefault();
  var btn = $('#btnGo');
  btn.button('loading');
  $.post( "query.php", $( this ).serialize(), formHandlerCallback ).always(function () {
      btn.button('reset');
    });
};

formHandlerCallback = function(responseData){
  if (responseData.error !== undefined) {
    showError(responseData.message);
    return;
  }
  $('#errContainer').hide();
  if (responseData.toptracks !== undefined) {
    buildTrackWordCloud(responseData.toptracks.track);
  }
  else if (responseData.topartists !== undefined) {
    buildArtistWordCloud(responseData.topartists.artist);
  }
};

showError = function(errMsg){
  $('#errDetail').text(errMsg);
  $('#errContainer').show();
};

buildArtistWordCloud = function(artists) {
  if (artists === undefined){
    showError("No data available for this user.");
    return;
  }
  var artistsLength = artists.length;
  var artist;
  var playcount;
  var words = [];
  var minCount,maxCount;
  for (var i = 0; i < artistsLength; i++) {
      artist = artists[i];
      playcount = parseInt(artist.playcount);
      words.push({'text': artist.name, 'size': playcount});
      if (minCount === undefined || playcount < minCount) {
        minCount = playcount;
      }
      if (maxCount === undefined || playcount > maxCount) {
        maxCount = playcount;
      }
  }
  buildWordCloud(words, minCount, maxCount);
};

buildTrackWordCloud = function(tracks) {
  if (tracks === undefined){
    showError("No data available for this user.");
    return;
  }
  var tracksLength = tracks.length;
  var track;
  var playcount;
  var words = [];
  var minCount,maxCount;
  for (var i = 0; i < tracksLength; i++) {
      track = tracks[i];
      playcount = parseInt(track.playcount);
      words.push({'text': track.name, 'size': playcount});
      if (minCount === undefined || playcount < minCount) {
        minCount = playcount;
      }
      if (maxCount === undefined || playcount > maxCount) {
        maxCount = playcount;
      }
  }
  buildWordCloud(words, minCount, maxCount);
};

buildWordCloud = function(words, minCount, maxCount){
  var range = maxCount - minCount;

  $('#svgWordCloud').remove();

  d3.layout.cloud().size([wcWidth, wcHeight])
      .words(words)
      .padding(5)
      .rotate(function() { return 0; })
      .font("Impact")
      .fontSize(function(d) { return 10 + 50 * (d.size - minCount) / (range) ; })
      .on("end", draw)
      .start();
};

function draw(words, bounds) {
  var fill = d3.scale.category20b();
  d3.select("#cloudHolder").append("svg").attr('id','svgWordCloud')
    .attr("width", wcWidth)
    .attr("height", wcHeight)
    .append("g")
    .attr("transform", "translate("+ wcWidth/2 +","+ wcHeight/2 +")")
    .selectAll("text")
    .data(words)
    .enter().append("text")
    .style("font-size", function(d) { return d.size + "px"; })
    .style("font-family", "Impact")
    .style("fill", function(d, i) { return fill(i); })
    .attr("text-anchor", "middle")
    .attr("transform", function(d) {
      return "translate(" + [d.x, d.y] + ")";
    })
    .text(function(d) { return d.text; });
}

$(onLoad);