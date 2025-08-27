export const protect = async (req,res,next) =>{
    try{
        const {userId} = await req.auth();
        if(!userId){
            return res.json({success: false , message: "Not authonticated"})
        }
        next()
    }catch(err){
        return res.json({success: false, message: err.message})
    }
}