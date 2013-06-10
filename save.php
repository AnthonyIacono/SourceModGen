<?php

mysql_connect('localhost', 'root', '');
mysql_select_db('smgen');

function MakeGuid() {
    $tl = str_pad(dechex(mt_rand(0, 65535)), 4, '0', STR_PAD_LEFT) . str_pad(dechex(mt_rand(0, 65535)), 4, '0', STR_PAD_LEFT);
    $tm = str_pad(dechex(mt_rand(0, 65535)), 4, '0', STR_PAD_LEFT);
    $th = mt_rand(0, 255);
    $th = $th & hexdec('0f');
    $th = $th ^ hexdec('40');
    $th = str_pad(dechex($th), 2, '0', STR_PAD_LEFT);
    $cs = mt_rand(0, 255);
    $cs = $cs & hexdec('3f');
    $cs = $cs ^ hexdec('80');
    $cs = str_pad(dechex($cs), 2, '0', STR_PAD_LEFT);
    $clock_seq_low = str_pad(dechex(mt_rand(0, 65535)), 4, '0', STR_PAD_LEFT);
    $node = str_pad(dechex(mt_rand(0, 65535)), 4, '0', STR_PAD_LEFT) . str_pad(dechex(mt_rand(0, 65535)), 4, '0', STR_PAD_LEFT) . str_pad(dechex(mt_rand(0, 65535)), 4, '0', STR_PAD_LEFT);
    return $tl . '-' . $tm . '-' . $th . $cs . '-' . $clock_seq_low . '-' . $node;
}

$_POST['indentUseSpaces'] = $_POST['indentUseSpaces'] == 'true' ? true : false;

foreach($_POST['fields'] as &$field) {
    $field['doNotSave'] = $field['doNotSave'] == 'true' ? true : false;
    $field['doNotLoad'] = $field['doNotLoad'] == 'true' ? true : false;
}

$dataEncoded = json_encode($_POST);
$guid = MakeGuid();

$dataEscaped = mysql_real_escape_string($dataEncoded);

$query = "INSERT INTO `smgen` (`guid`, `data`) VALUES ('{$guid}', '{$dataEscaped}')";

mysql_query($query);

die($guid);

