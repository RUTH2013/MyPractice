<?PHP

	require_once('connect.php');

	$id = $_GET['id']; // 获得要查询的 Id
	$sql = "select * from music_list where id = $id"; // 查询
	
	$query = mysql_query($sql); // 执行查询
	
	if( $query && mysql_num_rows($query) ){
		echo json_encode(mysql_fetch_assoc($query)); // 找到查询的结果
	}

?>