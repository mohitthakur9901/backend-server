// const asynchandler = (fn) =>  async (req,res,next) =>  {
//     try {
//         await fn(req, res, next);
//         return res.status(200).json({
//             success: true,
//             message: "Success"
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: "Something went wrong"
//         });
        
//     }
// }


const asynchandler = (requwstHandler) => {
    (req, res, next) => {
        Promise.resolve(requwstHandler(req,res,next))
        .catch((err) => next(err))
    }
}
export default asynchandler;