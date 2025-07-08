const ProgressBar = () => {
    return (
      <div className="relative h-5 rounded-full overflow-hidden bg-gray-300 mt-20 mx-10">
    <div 
    className="absolute w-50 top-0 bottom-0 left-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
    style={{ width: '50%' }}>
    </div>
</div>
    );
}

export default ProgressBar;