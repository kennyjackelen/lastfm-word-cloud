<?php
  # Query Handler (query.php)
  #  This file handles AJAX requests from the client and
  #  acts as the middleman between the app and last.fm's
  #  servers.

  define('LASTFM_API_KEY', '');
  define('METHOD_GET_TOP_TRACKS', '1');
  define('METHOD_GET_TOP_ARTISTS', '2');
  
  function main()
  {
    header('Content-type: application/json');
    $userID = $_POST['userID'];
    $period = $_POST['period'];
    $method = $_POST['method'];



    if ($method == METHOD_GET_TOP_TRACKS)
    {
      getTopTracks($userID, $period);
    }
    elseif ($method == METHOD_GET_TOP_ARTISTS)
    {
      getTopArtists($userID, $period);
    }
    else
    {
      returnError('Invalid method specified.');
    }
  }

  function validateUsername($userID)
  {
    if (strlen($userID) > 0)
      return true;

    returnError('Invalid username.');
    return false;
  }

  function validatePeriod($period)
  {
    if ($period == 'overall')
      return true;
    if ($period == '12month')
      return true;
    if ($period == '6month')
      return true;
    if ($period == '3month')
      return true;
    if ($period == '1month')
      return true;
    if ($period == '7day')
      return true;

    returnError('Invalid time period.');
    return false;
  }

  function getTopTracks($userID, $period)
  {
    if ( !validateUsername($userID) )
      return;
    if ( !validatePeriod($period) )
      return;

    $url = buildURL('user.gettoptracks', $userID, $period);
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_exec($ch);
    curl_close($ch);
  }

  function getTopArtists($userID, $period)
  {
    if ( !validateUsername($userID) )
      return;
    if ( !validatePeriod($period) )
      return;

    $url = buildURL('user.gettopartists', $userID, $period);
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_exec($ch);
    curl_close($ch);
  }

  function buildURL($method, $userID, $period)
  {
    $url = 'http://ws.audioscrobbler.com/2.0/?method=' . $method;
    $url .= '&user=' . $userID;
    $url .= '&api_key=' . LASTFM_API_KEY;
    $url .= '&period=' . $period;
    $url .= '&format=json';
    return $url;
  }

  function returnError($msg)
  {
    $error['error'] = 999;
    $error['message'] = $msg;
    echo json_encode($error);
  }

  main();

?>