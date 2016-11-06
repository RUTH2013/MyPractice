<?PHP

	require_once('connect.php');  // 引入connect.php文件
	
	$sql = "select id , name , musicName from music_list";  // 查询
	
	$query = mysql_query($sql);  // 执行查询
	
	if( $query && mysql_num_rows($query) ){  // mysql_num_rows($query) >0 时表示找到数据 
		while($row = mysql_fetch_assoc($query)){
			$data[] = $row;  // 将查询到的数据按照 键值 的方式存入数组中
		}
		echo json_encode($data);
	}

?>