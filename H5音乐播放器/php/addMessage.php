<?PHP

	require_once('connect.php');
	
	$mid = $_POST['mid'];
	$text = htmlspecialchars($_POST['text']);  // htmlspecialchars 用来处理 脚本 文字，进行编码
	
	$sql = "insert into message_list(mid,text) values($mid , '$text')"; //添加  now() 时间
	
	$query = mysql_query($sql);
	
	if($query){
		echo '{"code":"1","message":"'.$text.'"}'; // 成功
	}
	else{
		echo '{"code":"0","message":"添加失败"}'; // 失败
	}

?>