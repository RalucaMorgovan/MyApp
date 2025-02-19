// using Microsoft.AspNetCore.Mvc;
// using Microsoft.Data.SqlClient;
// using Microsoft.Extensions.Configuration;
// using System.Data;

// namespace ToDo.Controllers
// {
//     [ApiController]
//     public class ToDoController : ControllerBase
//     {
//         private readonly IConfiguration _configuration;

//         public ToDoController(IConfiguration configuration)
//         {
//             _configuration = configuration;
//         }

//         [HttpGet("get_tasks")]
//         public JsonResult GetTasks()
//         {
//             string query = "SELECT * FROM todolist";
//             DataTable table = new DataTable();
//             string connectionString = _configuration.GetConnectionString("todolist");
//             SqlDataReader myReader;

//             using (SqlConnection connection = new SqlConnection(connectionString))
//             {
//                 connection.Open();
//                 using (SqlCommand command = new SqlCommand(query, connection))
//                 {
//                     myReader = command.ExecuteReader();
//                     table.Load(myReader);
//                 }
//             }

//             return new JsonResult(table);
//         }

//         [HttpPost("add_tasks")]
//         public JsonResult AddTask([FromForm] string descriere, [FromForm] string data, [FromForm] string ora)
//         {
//             string query = "INSERT INTO todolist (descriere, data, ora, isCompleted) VALUES (@descriere, @data, @ora, 0)";
//             DataTable table = new DataTable();
//             string connectionString = _configuration.GetConnectionString("todolist");
//             SqlDataReader myReader;

//             using (SqlConnection connection = new SqlConnection(connectionString))
//             {
//                 connection.Open();
//                 using (SqlCommand command = new SqlCommand(query, connection))
//                 {
//                     command.Parameters.AddWithValue("@descriere", descriere);
//                     command.Parameters.AddWithValue("@data", data);
//                     command.Parameters.AddWithValue("@ora", ora);
//                     myReader = command.ExecuteReader();
//                     table.Load(myReader);
//                 }
//             }

//             return new JsonResult("S-a adaugat sarcina");
//         }

//         [HttpPost("update_tasks")]
//         public JsonResult UpdateTask([FromForm] string id, [FromForm] string descriere, [FromForm] string data, [FromForm] string ora, [FromForm] bool isCompleted)
//         {
//             string query = "UPDATE todolist SET descriere = @descriere, data = @data, ora = @ora, isCompleted = @isCompleted WHERE id = @id";
//             DataTable table = new DataTable();
//             string connectionString = _configuration.GetConnectionString("mydb");
//             SqlDataReader myReader;

//             using (SqlConnection connection = new SqlConnection(connectionString))
//             {
//                 connection.Open();
//                 using (SqlCommand command = new SqlCommand(query, connection))
//                 {
//                     command.Parameters.AddWithValue("@descriere", descriere);
//                     command.Parameters.AddWithValue("@data", data);
//                     command.Parameters.AddWithValue("@ora", ora);
//                     command.Parameters.AddWithValue("@isCompleted", isCompleted);
//                     command.Parameters.AddWithValue("@id", id);
//                     myReader = command.ExecuteReader();
//                     table.Load(myReader);
//                 }
//             }

//             return new JsonResult("S-a editat!");
//         }

//         [HttpPost("delete_tasks")]
//         public JsonResult DeleteTask([FromForm] string id)
//         {
//             string query = "DELETE FROM todo WHERE id = @id";
//             DataTable table = new DataTable();
//             string connectionString = _configuration.GetConnectionString("todolist");
//             SqlDataReader myReader;

//             using (SqlConnection connection = new SqlConnection(connectionString))
//             {
//                 connection.Open();
//                 using (SqlCommand command = new SqlCommand(query, connection))
//                 {
//                     command.Parameters.AddWithValue("@id", id);
//                     myReader = command.ExecuteReader();
//                     table.Load(myReader);
//                 }
//             }

//             return new JsonResult("S-a sters");
//         }

//         [HttpPost("completed")]
//         public JsonResult Completed([FromForm] string id)
//         {
//             string query = "UPDATE todolist SET isCompleted = 1 WHERE id = @id";
//             DataTable table = new DataTable();
//             string connectionString = _configuration.GetConnectionString("todolist");
//             SqlDataReader myReader;

//             using (SqlConnection connection = new SqlConnection(connectionString))
//             {
//                 connection.Open();
//                 using (SqlCommand command = new SqlCommand(query, connection))
//                 {
//                     command.Parameters.AddWithValue("@id", id);
//                     myReader = command.ExecuteReader();
//                     table.Load(myReader);
//                 }
//             }

//             return new JsonResult("S-a finalizat");
//         }
//     }
// }
