export const About = () => {
    return (
        <div className="text-center px-4 flex flex-col justify-center items-center">
            <p className="w-[75%]">The NBA is an oftentimes unpredictable league with players' performance fluctuating from night to night. Nevertheless, we can look into the past to help predict what will happen in the future. At PickKings, we consider three factors, two of which help determine our decision, and another that contributes to calculating our confidence level.</p>
            <h2 className="p-4 font-semibold">1) Last Ten Games</h2>
            <p className="w-[75%]">Utilizing CheerioJS and Puppeteer, we are able to webscrape a player's last ten games and their performance (based on what objective we are trying to bet on). Using this data, we find the percentage of times the player has gone OVER or UNDER the line, and take the larger of the two numbers for future calculations.</p>
            <h2 className="p-4 font-semibold">2) Season Average</h2>
            <p className="w-[75%]">We find the player's season average in the objective we are betting on, used to calculate a percentaged based on the value provided by the betting sites.</p>
            <p className="pt-4 font-semibold w-[75%]">These two metrics are summed together and if the value is positive, the OVER is determined, otherwise the better option is the UNDER. Note that performance in the last ten games is more heavily weighted than season average because it provides a better idea of how the player has been performing most recently.</p>
            <h2 className="pt-4 font-semibold">3) Team Percentage Differential</h2>
            <p className="w-[75%]">The team percentage differential is calculated by taking the absolute value of the player's team and the opponent's team win percentage this season. The smaller the difference, the more close in performance they are, and there is less likely going to be a blowout in which players may be subbed out. This will lead us to have a higher confidence in our decision.</p>
            <p className="font-bold pt-4">DISCLAIMER: Ultimately, however, it's in the players' hands. Sports betting is after all, gambling. If the players' performance was easy to predict, everybody would make money.</p>
        </div>
    )
}